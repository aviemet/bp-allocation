import CheckIcon from "@mui/icons-material/Check"
import {
	Box,
	Chip,
	Grid,
	Paper,
	Stack,
	TableContainer,
	Table,
	TableHead,
	TableBody,
	TableFooter,
	TableRow,
	TableCell,
	Typography,
} from "@mui/material"
import { format } from "date-fns"
import numeral from "numeral"
import { useState } from "react"
import { useTheme, useMembers, useOrgs, type PledgeWithOrg, getFormattedName } from "/imports/api/hooks"
import { formatMatchRatioFromMultiplier, matchMultiplierForPledge } from "/imports/lib/allocation/pledgeMatching"
import { OrganizationMethods } from "/imports/api/methods"
import { PledgesActiveToggle } from "/imports/ui/components/Toggles"
import { ReplayPledgeAnimationButton } from "/imports/ui/components/Buttons/ReplayPledgeAnimationButton"
import { ConfirmationModal, Loading, SortableTable, type HeadCell } from "/imports/ui/components"

const headCells: HeadCell[] = [
	{
		id: "org.title",
		label: "Organization",
	},
	{
		id: "member",
		label: "Pledger",
	},
	{
		id: "amount",
		label: "Amount",
	},
	{
		id: "ratio",
		label: "Match Ratio",
		align: "center",
	},
	{
		id: "anonymous",
		label: "Anon",
		align: "center",
	},
	{
		id: "createdAt",
		label: "Time",
		disablePadding: true,
	},
	{
		id: "actions",
		label: "Replay Animation",
		sort: false,
		align: "center",
	},
]

interface PledgesProps {
	hideAdminFields?: boolean
}

export const Pledges = ({ hideAdminFields = false }: PledgesProps) => {
	const { theme } = useTheme()
	const { members, membersLoading } = useMembers()
	const { orgs, topOrgs, pledges, orgsLoading } = useOrgs()

	const orgsForTotals = theme?.allowRunnersUpPledges ? orgs : topOrgs
	const topOrgIds = new Set(topOrgs.map(org => org._id))
	const isRunnerUp = (orgId: string) => !topOrgIds.has(orgId)

	const sortedOrgsForTotals = theme?.allowRunnersUpPledges
		? [...orgsForTotals].sort((a, b) => {
			const aIsRunnerUp = isRunnerUp(a._id)
			const bIsRunnerUp = isRunnerUp(b._id)
			if(aIsRunnerUp === bIsRunnerUp) return 0
			return aIsRunnerUp ? 1 : -1
		})
		: orgsForTotals

	const [ modalOpen, setModalOpen ] = useState(false)
	const [ modalHeader, setModalHeader ] = useState("")
	const [ modalContent, setModalContent ] = useState("")
	const [ modalAction, setModalAction ] = useState<(() => void) | undefined>()

	const bulkDelete = (selected: string[], onSuccess: () => void) => {
		const plural = selected.length > 1

		setModalHeader(`Permanently unlink member${plural ? "s" : ""} from this theme?`)
		setModalContent(`This will permanently delete the selected pledge${plural ? "s" : ""}. This action cannot be reversed.`)
		// Need to curry the function since useState calls passed functions
		setModalAction( () => async () => {
			if(!theme) return
			await OrganizationMethods.removePledgeById.callAsync({ themeId: theme._id, pledgeIds: selected })
			onSuccess()
		})
		setModalOpen(true)
	}

	if(orgsLoading || membersLoading || !members) return <Loading />
	return (
		<>
			<Grid container spacing={ 2 }>
				<Grid size={ { xs: 12, md: 8 } }>
					<Box sx={ {
						"& td.MuiTableCell-root, & th.MuiTableCell-root": {
							py: 1.25,
							px: 1.75,
						},
					} }>
						<SortableTable<PledgeWithOrg>
							title={ <Stack direction="row" sx={ { alignItems: "center", justifyContent: "space-between" } }>
								<Box>Pledges</Box>
								<Box><PledgesActiveToggle /></Box>
							</Stack> }
							onBulkDelete={ bulkDelete }
							headCells={ headCells }
							rows={ pledges }
							defaultOrderBy="createdAt"
							paginate={ false }
							striped={ true }
							selectable={ !hideAdminFields }
							render={ pledge => {
								const member = pledge.member ? members.find(value => value._id === pledge.member) : undefined
								const isPledgeRunnerUp = isRunnerUp(pledge.org._id)
								return (
									<>
										{ /* Org Title */ }
										<TableCell component="th" scope="row">
											<Stack direction="column" spacing={ 0.5 } sx={ { alignItems: "flex-start" } }>
												<span>{ pledge.org.title }</span>
												{ isPledgeRunnerUp && (
													<Chip
														label="Runner Up"
														size="small"
														color="secondary"
														variant="outlined"
													/>
												) }
											</Stack>
										</TableCell>

										{ /* Member */ }
										<TableCell>
											{ member ? getFormattedName(member) : "" }
										</TableCell>

										{ /* Amount */ }
										<TableCell align="right">
											<Stack direction="row" sx={ { justifyContent: "space-between", alignItems: "baseline" } }>
												<div>$</div>
												<div>{ numeral(pledge.amount).format("0,0.00") }</div>
											</Stack>
										</TableCell>

										<TableCell align="center">
											{ theme
												? formatMatchRatioFromMultiplier(matchMultiplierForPledge(pledge, theme))
												: "" }
										</TableCell>

										{ /* Anonymous */ }
										<TableCell align="center">
											{ pledge.anonymous && <CheckIcon /> }
										</TableCell>

										{ /* Pledge Timestamp */ }
										<TableCell sx={ { whiteSpace: "nowrap" } }>
											{ pledge.createdAt && format(pledge.createdAt, "hh:mm a") }
										</TableCell>

										{ /* Replay Animation */ }
										<TableCell align="center">
											<ReplayPledgeAnimationButton pledge={ pledge } />
										</TableCell>
									</>
								)
							} }
						/>
					</Box>
				</Grid>

				<Grid size={ { xs: 12, md: 4 } }>
					<Paper>
						<TableContainer>
							<Table>
								<TableHead>
									<TableRow>
										<TableCell colSpan={ 2 } align="center">
											<Typography component="p" variant="h6" >Totals</Typography>
										</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{ sortedOrgsForTotals.map(org => (
										<TableRow
											key={ org._id }
											sx={ {
												backgroundColor: isRunnerUp(org._id) ? "action.hover" : "transparent",
											} }
										>
											<TableCell key={ org._id }>
												{ org.title }
											</TableCell>
											<TableCell align="right">
												<Stack direction="row" sx={ { justifyContent: "space-between", alignItems: "baseline" } }>
													<Box sx={ { mr: 1 } }>$</Box>
													<Box>{ numeral(org.pledges?.reduce((sum, pledge) => sum + pledge.amount, 0) ?? 0).format("0,0.00") }</Box>
												</Stack>
											</TableCell>
										</TableRow>
									)) }
								</TableBody>
								<TableFooter>
									<TableRow>
										<TableCell align="right">Total:</TableCell>
										<TableCell>
											<Stack direction="row" sx={ { justifyContent: "space-between", alignItems: "baseline" } }>
												<Box sx={ { mr: 1 } }>$</Box>
												<Box>{ numeral(theme?.pledgedTotal ?? 0).format("0,0.00") }</Box>
											</Stack>
										</TableCell>
									</TableRow>
								</TableFooter>
							</Table>
						</TableContainer>
					</Paper>
				</Grid>
			</Grid>

			<ConfirmationModal
				isModalOpen={ modalOpen }
				handleClose={ () => setModalOpen(false) }
				header={ modalHeader }
				content={ modalContent }
				confirmAction={ modalAction ?? (() => {}) }
			/>
		</>
	)
}

