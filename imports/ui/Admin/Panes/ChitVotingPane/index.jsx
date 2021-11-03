import React, { useEffect, useState } from 'react'

import { observer } from 'mobx-react-lite'
import { useOrgs, useSettings } from '/imports/api/providers'

import { Grid, Table, Loader } from 'semantic-ui-react'

import ChitInputs from './ChitInputs'
import TopOrgsByChitVote from './TopOrgsByChitVote'
import { useWindowSize, breakpoints } from '/imports/ui/MediaProvider'

const ChitVotingPane = observer(() => {
	const { settings } = useSettings()
	const { orgs, topOrgs, isLoading: orgsLoading } = useOrgs()
	const { width } = useWindowSize()

	const [ gridColumns, setGridColumns ] = useState(settings.useKioskChitVoting ? 1 : 2)

	useEffect(() => {
		if(settings.useKioskChitVoting || width < breakpoints.tablet) {
			setGridColumns(1)
		} else {
			setGridColumns(2)
		}
	}, [settings.useKioskChitVoting, width])

	if(orgsLoading) return <Loader active />

	const topOrgIds = topOrgs.map(org => org._id)

	return (
		<Grid
			columns={ gridColumns }
			divided={ gridColumns > 1 }
		>
			<Grid.Row>

				{ !settings.useKioskChitVoting && <Grid.Column>

					<Table celled striped columns={ 3 }>
						<Table.Header>
							<Table.Row>
								<Table.HeaderCell>Organization</Table.HeaderCell>
								<Table.HeaderCell>Weight of Tokens</Table.HeaderCell>
								<Table.HeaderCell>Token Count</Table.HeaderCell>
							</Table.Row>
						</Table.Header>

						<Table.Body>
							{orgs.values.map((org, i) => (
								<ChitInputs
									org={ org }
									key={ i }
									tabInfo={ { index: i + 1, length: orgs.length } }
									positive={ topOrgIds.includes(org._id) }
								/>
							))}
						</Table.Body>
					</Table>

				</Grid.Column> }

				<Grid.Column>
					<TopOrgsByChitVote />
				</Grid.Column>

			</Grid.Row>
		</Grid>
	)
})

ChitVotingPane.propTypes = {}

export default ChitVotingPane
