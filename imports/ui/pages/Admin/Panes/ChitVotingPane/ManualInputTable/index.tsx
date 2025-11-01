import { useState, useEffect } from "react"
import PropTypes from "prop-types"

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
import { observer } from "mobx-react-lite"
import { useOrgs } from "/imports/api/providers"

const ChitTable = () => {
	const { orgs, topOrgs } = useOrgs()

	const topOrgIds = topOrgs.map(org => org._id)

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
					{ orgs.values.map((org, i) => (
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

const ChitInputs = observer(({ org, tabInfo, topOrg }) => {
	const [ weightVotes, setWeightVotes ] = useState(org.chitVotes.weight)
	const [ countVotes, setCountVotes ] = useState(org.chitVotes.count)

	useEffect(() => {
		saveVotes()
	}, [weightVotes, countVotes])

	const saveVotes = async () => {
		await OrganizationMethods.update.callAsync({
			id: org._id,
			data: {
				chitVotes: {
					count: countVotes,
					weight: weightVotes,
				},
			},
		})
	}

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
})

ChitInputs.propTypes = {
	org: PropTypes.object,
	tabInfo: PropTypes.object,
	topOrg: PropTypes.bool,
}

export default ChitTable
