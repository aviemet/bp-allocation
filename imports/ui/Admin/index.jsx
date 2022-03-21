import React from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'

import Container from '@mui/material/Container'

import {
	OrganizationsPane,
	OrganizationsEdit,
	OrganizationsImport,
	MembersPane,
	MembersImport,
	MembersEdit,
	SettingsPane,
	OverviewPane,
	MessagingPane,
	MessageEdit,
	ChitVotingPane,
	AllocationPane,
	PledgesPane,
	LeveragePane,
	PresentationPane,
} from '/imports/ui/Admin/Panes'

import useTheme from '@mui/material/styles/useTheme'

const Admin = () => {
	const theme = useTheme()
	console.log({ theme })

	return (
		<Container>
			<Switch>
				<Route exact path='/admin/:id/orgs' component={ OrganizationsPane } />
				<Route exact path='/admin/:id/orgs/import' component={ OrganizationsImport } />
				<Route exact path={ ['/admin/:id/orgs/new', '/admin/:id/orgs/:orgId'] } component={ OrganizationsEdit } />

				<Route exact path='/admin/:id/members' component={ MembersPane } />
				<Route exact path='/admin/:id/members/import' component={ MembersImport } />
				<Route exact path={ ['/admin/:id/members/new', '/admin/:id/members/:memberId'] } component={ MembersEdit } />

				<Route exact path='/admin/:id/chits' component={ ChitVotingPane } />

				<Route exact path='/admin/:id/allocation' component={ AllocationPane } />

				<Route exact path='/admin/:id/pledges' component={ PledgesPane } />

				<Route exact path='/admin/:id/leverage' component={ LeveragePane } />

				<Route path='/admin/:id/messaging' component={ MessagingPane } />

				<Route exact path={ ['/admin/:id', '/admin/:id/presentation'] } component={ PresentationPane } />

				<Route exact path='/admin/:id/settings' render={ ({ match }) => (
					<Redirect to={ `/admin/${match.params.id}/settings/general` } />
				) } />
				<Route exact path='/admin/:id/settings/:activeTab' component={ SettingsPane } />
				<Route exact path='/admin/:id/settings/messages/new/:type' component={ MessageEdit } />
				<Route exact path='/admin/:id/settings/messages/:messageId' component={ MessageEdit } />

				<Route exact path='/admin/:id/overview' component={ OverviewPane } />

			</Switch>
		</Container>
	)
}

export default Admin
