import React from 'react'
import PropTypes from 'prop-types'
import numeral from 'numeral'

import { observer } from 'mobx-react-lite'
import { toJS } from 'mobx'
import { useTheme, useMembers, useOrgs } from '/imports/api/providers'
import { OrganizationMethods } from '/imports/api/methods'

import { Container, Header, Table, Button, Loader } from 'semantic-ui-react'
import styled from 'styled-components'

const Pledges = observer(props => {
	const { theme } = useTheme()
	const { members, isLoading: membersLoading } = useMembers()
	const { orgs, isLoading: orgsLoading } = useOrgs()

	console.log({ orgs: toJS(orgs.values) })

	const deletePledge = (e, data) => {
		const pledgeId = data.pledgeid
		const orgId = data.orgid

		OrganizationMethods.removePledge.call({ orgId, pledgeId })
	}

	if(orgsLoading || membersLoading || !members) return <Loader active />

	return (
		<PledgesContainer>
			<Header as="h2">Matched Pledges (x{ theme.matchRatio })</Header>
			<Table striped>
				<Table.Header>
					<Table.Row>
						<Table.HeaderCell collapsing>Organization</Table.HeaderCell>
						<Table.HeaderCell>Pledged By</Table.HeaderCell>
						<Table.HeaderCell collapsing>Amount</Table.HeaderCell>
						{ !props.hideAdminFields && <Table.HeaderCell collapsing></Table.HeaderCell> }
					</Table.Row>
				</Table.Header>

				<Table.Body>
					{ orgs.pledges.map(pledge => {

						let member = pledge.member ? members.values.find(value => value._id === pledge.member) : ''
						return (
							<Table.Row key={ pledge._id }>
								<Table.Cell singleLine>{ pledge.org.title }</Table.Cell>
								<Table.Cell>
									{ member && member.hasOwnProperty('formattedName') ?
										member.formattedName :
										''
									}
								</Table.Cell>
								<Table.Cell>{ numeral(pledge.amount).format('$0,0') }</Table.Cell>
								{ !props.hideAdminFields &&
									<Table.Cell>
										<Button
											color='red'
											icon='trash'
											onClick={ deletePledge }
											pledgeid={ pledge._id }
											orgid={ pledge.org._id }
										/>
									</Table.Cell>
								}
							</Table.Row>
						)
					}) }
				</Table.Body>
			</Table>
		</PledgesContainer>
	)
})

const PledgesContainer = styled(Container)`
	.ui.fluid.search .ui.icon.input {
		width: 100%;
	}
`

Pledges.propTypes = {
	hideAdminFields: PropTypes.bool
}

export default Pledges

