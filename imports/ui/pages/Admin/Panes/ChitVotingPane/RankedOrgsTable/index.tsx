import styled from "@emotion/styled"
import LockIcon from "@mui/icons-material/Lock"
import {
	Paper,
	Table,
	TableContainer,
	TableHead,
	TableBody,
	TableFooter,
	TableRow,
	TableCell,
	TextField,
	Typography,
} from "@mui/material"
import { findIndex } from "lodash"
import { observer } from "mobx-react-lite"
import { ThemeMethods } from "/imports/api/methods"
import { useSettings, useTheme, useOrgs } from "/imports/api/providers"

import TopOrgsRow from "./TopOrgsRow"
import { sortTopOrgs } from "/imports/lib/orgsMethods"

interface TopOrgsByChitVoteProps {
	hideAdminFields?: boolean
}

const TopOrgsByChitVote = observer(({ hideAdminFields }: TopOrgsByChitVoteProps) => {
	const { settings } = useSettings()
	const { theme } = useTheme()
	const { orgs } = useOrgs()

	let sortedOrgs = sortTopOrgs(orgs.values, theme)
	let totalVotes = 0
	return (
		<>

			<TableContainer component={ Paper }>
				<Table>

					<TableHead>
						<TableRow>
							<TableCell>
								<FlexHeading>
									<span className="full">Organization</span>
									<span>
										{ settings?.useKioskChitVoting && `(${theme.chitVotesCast}/${theme.totalMembers}) Members Have Voted` }
									</span>
								</FlexHeading>
							</TableCell>
							<TableCell>Votes</TableCell>
							<TableCell padding="checkbox"><LockIcon /></TableCell>
						</TableRow>
					</TableHead>

					<TableBody>
						{ sortedOrgs.map((org, i) => {
							const inTopOrgs = i < theme.numTopOrgs
							const _isLocked = theme.topOrgsManual.includes(org._id)
							const _isSaved = (findIndex(theme.saves, ["org", org._id]) >= 0)
							totalVotes += org.votes || 0

							return (
								<TopOrgsRow
									key={ i }
									inTopOrgs={ inTopOrgs }
									isLocked={ _isLocked }
									isSaved={ _isSaved }
									themeId={ theme._id }
									org={ org }
									hideAdminFields={ hideAdminFields || false }
								/>
							)

						}) }
					</TableBody>

					<TableFooter>
						<TableRow>
							<TableCell align="right">Total Votes:</TableCell>
							<TableCell>
								<div style={ { whiteSpace: "nowrap" } }>
									<span>{ totalVotes }</span>
									{ settings?.useKioskChitVoting && ` / ${theme.totalChitVotes}` }
								</div>
							</TableCell>
							<TableCell></TableCell>
						</TableRow>
					</TableFooter>

				</Table>
			</TableContainer>
		</>
	)
})

const NumTopOrgsInput = styled(TextField)`
	width: 65px;

	&& input {
		padding: 0.3em 0.4em;
	}
`

const FlexHeading = styled.div`
	display: flex;
	justify-content: space-between;
	flex-wrap: wrap;

	span.full {
		flex: 1;
	}
`

export default TopOrgsByChitVote
