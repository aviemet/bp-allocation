import React from 'react'
import { Router, Route, Redirect, Switch } from 'wouter'

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
	// const { theme } = useTheme()
	console.log('Admin')
	return (
		<Container>
			<Router>
				<Switch>
					<Route path='/admin/:id/orgs'><OrganizationsPane /></Route>
					<Route path='/admin/:id/orgs/import'><OrganizationsImport /></Route>

					<Route path='/admin/:id/orgs/new'><OrganizationsEdit /></Route>
					<Route path='/admin/:id/orgs/:orgId'><OrganizationsEdit /></Route>

					<Route path='/admin/:id/members'><MembersPane /></Route>
					<Route path='/admin/:id/members/import'><MembersImport /></Route>

					<Route path='/admin/:id/members/new'><MembersEdit /></Route>
					<Route path='/admin/:id/members/:memberId'><MembersEdit /></Route>

					<Route path='/admin/:id/chits'><ChitVotingPane /></Route>

					<Route path='/admin/:id/allocation'><AllocationPane /></Route>

					<Route path='/admin/:id/pledges'><PledgesPane /></Route>

					<Route path='/admin/:id/leverage'><LeveragePane /></Route>

					<Route path='/admin/:id/messaging'><MessagingPane /></Route>

					<Route path='/admin/:id'><PresentationPane /></Route>
					<Route path='/admin/:id/presentation'><PresentationPane /></Route>

					{ /* <Route path='/admin/:id/settings' render={ ({ match }) => (
					<Navigate to={ `/admin/${match.params.id}/settings/general` } />
				) } /> */ }
					<Route path='/admin/:id/settings/:activeTab'><SettingsPane /></Route>
					<Route path='/admin/:id/settings/messages/new/:type'><MessageEdit /></Route>
					<Route path='/admin/:id/settings/messages/:messageId'><MessageEdit /></Route>

					<Route path='/admin/:id/overview'><OverviewPane /></Route>
				</Switch>
			</Router>
		</Container>
	)
}

export default Admin
