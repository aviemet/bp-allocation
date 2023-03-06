import { Meteor } from 'meteor/meteor'
import React from 'react'
import { Route, Router, Redirect } from 'wouter'
import ShortRoute from './ShortRoute'
import LoadingRoute from './LoadingRoute'
import PrivateRoute from './PrivateRoute'
import { observer } from 'mobx-react-lite'
import { AdminLayout, WelcomeLayout, PresentationLayout, KioskLayout } from '/imports/ui/Layouts'
import Presentation from '/imports/ui/Presentation'
import Simulation from '/imports/ui/Admin/Simulation'
import Pledges from '/imports/ui/Pledges'
import Login from '/imports/ui/Welcome/Login'
import Kiosk from '/imports/ui/Kiosk'
import FourOhFour from './404'

const AppRoutes = observer(() => (
	<Router>

		<Route path='/login'>{
			!Meteor.userId()
				?
				<><WelcomeLayout><Login /></WelcomeLayout></>
				:
				<Redirect to='/' />
		}</Route>

		<Route path='/'><Redirect to='/admin' /></Route>

		<Route path='/admin'>
			<PrivateRoute>
				<AdminLayout />
			</PrivateRoute>
		</Route>

		<LoadingRoute path='/presentation/:id'>
			<PresentationLayout>
				<Presentation />
			</PresentationLayout>
		</LoadingRoute>

		<Route path='/v/:themeSlug/:memberCode'><ShortRoute /></Route>

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
	</Router>
))


export default AppRoutes
