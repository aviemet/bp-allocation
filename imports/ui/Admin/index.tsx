import React from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'

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
	useTheme()

	return (
		<Container>
			<Routes>
				<Route path='/admin/:id/orgs' element={ <OrganizationsPane /> } />
				<Route path='/admin/:id/orgs/import' element={ <OrganizationsImport /> } />

				<Route path='/admin/:id/orgs/new' element={ <OrganizationsEdit /> } />
				<Route path='/admin/:id/orgs/:orgId' element={ <OrganizationsEdit /> } />

				<Route path='/admin/:id/members' element={ <MembersPane /> } />
				<Route path='/admin/:id/members/import' element={ <MembersImport /> } />

				<Route path='/admin/:id/members/new' element={ <MembersEdit /> } />
				<Route path='/admin/:id/members/:memberId' element={ <MembersEdit /> } />

				<Route path='/admin/:id/chits' element={ <ChitVotingPane /> } />

				<Route path='/admin/:id/allocation' element={ <AllocationPane /> } />

				<Route path='/admin/:id/pledges' element={ <PledgesPane /> } />

				<Route path='/admin/:id/leverage' element={ <LeveragePane /> } />

				<Route path='/admin/:id/messaging' element={ <MessagingPane /> } />

				<Route path='/admin/:id' element={ <PresentationPane /> } />
				<Route path='/admin/:id/presentation' element={ <PresentationPane /> } />

				{ /* <Route path='/admin/:id/settings' render={ ({ match }) => (
					<Navigate to={ `/admin/${match.params.id}/settings/general` } />
				) } /> */ }
				<Route path='/admin/:id/settings/:activeTab' element={ <SettingsPane /> } />
				<Route path='/admin/:id/settings/messages/new/:type' element={ <MessageEdit /> } />
				<Route path='/admin/:id/settings/messages/:messageId' element={ <MessageEdit /> } />

				<Route path='/admin/:id/overview' element={ <OverviewPane /> } />

			</Routes>
		</Container>
	)
}

export default Admin
