import React from 'react'
import { Route } from 'react-router-dom'
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

const Admin = () => {
	return (
		<Container>
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
		</Container>
	)
}

export default Admin
