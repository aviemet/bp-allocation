import {
	TextField,
	Paper,
	Table,
	TableContainer,
	TableHead,
	TableBody,
	TableRow,
	TableCell,
} from "@mui/material"
import { OrganizationMethods } from "/imports/api/methods"
import { useState, useEffect, useCallback } from "react"
import { useOrgs, type OrgDataWithComputed } from "/imports/api/hooks"
import { Loading } from "/imports/ui/components"

const ChitTable = () => {
	const { orgs, topOrgs } = useOrgs()

	const topOrgIds = topOrgs.map(org => org._id)

	if(!orgs) return <Loading />

	return (
		<TableContainer component={ Paper }>
			<Table>
				<TableHead>
					<TableRow>
						<TableCell>Organization</TableCell>
						<TableCell>Weight of Tokens</TableCell>
						<TableCell>Token Count</TableCell>
					</TableRow>
				</TableHead>

				<TableBody>
					{ orgs.map((org, i) => (
						<ChitInputs
							org={ org }
							key={ i }
							tabInfo={ { index: i + 1, length: orgs.length } }
							topOrg={ topOrgIds.includes(org._id) }
						/>
					)) }
				</TableBody>
			</Table>
		</TableContainer>
	)
}

interface ChitInputsProps {
	org: OrgDataWithComputed
	tabInfo: { index: number, length: number }
	topOrg: boolean
}

const ChitInputs = ({ org, tabInfo, topOrg }: ChitInputsProps) => {
	const [ weightVotes, setWeightVotes ] = useState(org.chitVotes?.weight ?? 0)
	const [ countVotes, setCountVotes ] = useState(org.chitVotes?.count ?? 0)

	const saveVotes = useCallback(async () => {
		await OrganizationMethods.update.callAsync({
			id: org._id,
			data: {
				chitVotes: {
					count: countVotes,
					weight: weightVotes,
				},
			},
		})
	}, [org._id, countVotes, weightVotes])

	useEffect(() => {
		saveVotes()
	}, [saveVotes])

	const rowSx = topOrg ? { sx: { backgroundColor: "table.highlight" } } : {}

	return (
		<TableRow { ...rowSx }>

			<TableCell width={ 12 }>{ org.title }</TableCell>

			<TableCell width={ 3 }>
				<TextField
					size="small"
					name="weightVotes"
					type="number"
					tabIndex={ tabInfo.index }
					value={ weightVotes || "" }
					onChange={ e => setWeightVotes(e.currentTarget.value ? parseFloat(e.currentTarget.value) : 0) }
					sx={ { background: "white" } }
				/>
			</TableCell>

			<TableCell width={ 3 }>
				<TextField
					size="small"
					name="countVotes"
					type="number"
					tabIndex={ tabInfo.index + tabInfo.length || 0 }
					value={ countVotes || "" }
					onChange={ e => setCountVotes(e.currentTarget.value ? parseFloat(e.currentTarget.value) : 0) }
					sx={ { background: "white" } }
				/>
			</TableCell>

		</TableRow>
	)
}

export default ChitTable
