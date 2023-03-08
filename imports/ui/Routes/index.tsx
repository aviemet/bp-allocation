import { Meteor } from 'meteor/meteor'
import React from 'react'
import { Route, BrowserRouter, Navigate, Routes } from 'react-router-dom'
import ShortRoute from './ShortRoute'
import LoadingRoute from './LoadingRoute'
import PrivateRoute from './PrivateRoute'
import { observer } from 'mobx-react-lite'
import Container from '@mui/material/Container'
import { AdminLayout, WelcomeLayout, PresentationLayout, KioskLayout } from '/imports/ui/Layouts'
import Presentation from '/imports/ui/Presentation'
import Simulation from '/imports/ui/Admin/Simulation'
import ThemesList from '/imports/ui/Admin/ThemesList'
import Admin from '/imports/ui/Admin'
import Pledges from '/imports/ui/Pledges'
import Login from '/imports/ui/Welcome/Login'
import Kiosk from '/imports/ui/Kiosk'
import FourOhFour from './404'

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

const AppRoutes = observer(() => {
	return (
		<BrowserRouter>
			<Routes>

				<Route path='/login' element={
					!Meteor.userId()
						?
						<WelcomeLayout><Login /></WelcomeLayout>
						:
						<Navigate to='/' />
				} />

				<Route path='/' element={ <Navigate to='/admin' /> } />

				<Route path='/admin' element={ <PrivateRoute><AdminLayout /></PrivateRoute> }>
					<Route index element={ <ThemesList /> } />

					<Route path=':id' element={ <Container><LoadingRoute /></Container> }>

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


						<Route path='/admin/:id/settings/:activeTab' element={ <SettingsPane /> } />
						<Route path='/admin/:id/settings/messages/new/:type' element={ <MessageEdit /> } />
						<Route path='/admin/:id/settings/messages/:messageId' element={ <MessageEdit /> } />

						<Route path='/admin/:id/overview' element={ <OverviewPane /> } />
					</Route>
				</Route>

				<Route path='/presentation' element={ <PresentationLayout><LoadingRoute /></PresentationLayout> } >
					<Route path=':id' element={ <Presentation /> } />
				</Route>
				{ /*
			<Route path='/v/:themeSlug/:memberCode' element={ <ShortRoute /> } />

			<LoadingRoute path={ ['/voting/:id/:member', '/kiosk/:id'] }>
				<KioskLayout>
					<Kiosk />
				</KioskLayout>
			</LoadingRoute>

			<LoadingRoute path='/simulation/:id'>
				<PresentationLayout>
					<Simulation />
				</PresentationLayout>
			</LoadingRoute>

			<LoadingRoute path='/pledges/:id'>
				<KioskLayout>
					<Pledges />
				</KioskLayout>
			</LoadingRoute>

			<Route path='/404'><FourOhFour /></Route>
			<Route path='*'><Navigate to='/404' /></Route> */ }
			</Routes>
		</BrowserRouter>
	)
})


export default AppRoutes


/* <Route path='/admin/:id/settings' render={ ({ match }) => (
	<Navigate to={ `/admin/${match.params.id}/settings/general` } />
) } /> */
