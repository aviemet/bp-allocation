import { Meteor } from 'meteor/meteor'
import React from 'react'
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom'

import PrivateRoute from './PrivateRoute'
import LoadingRoute from './LoadingRoute'
import ShortRoute from './ShortRoute'

import { observer } from 'mobx-react-lite'

import { AdminLayout, WelcomeLayout, PresentationLayout, KioskLayout } from '/imports/ui/Layouts'
import Presentation from '/imports/ui/Presentation'
import Simulation from '/imports/ui/Admin/Simulation'
import Pledges from '/imports/ui/Pledges'
import Login from '/imports/ui/Welcome/Login'
import Kiosk from '/imports/ui/Kiosk'
import FourOhFour from './404'

const Routes = observer(() => (
	<BrowserRouter>
		<Switch>

			<Route path='/login' render={ () => (
				!Meteor.userId()
					? <WelcomeLayout><Login /></WelcomeLayout>
					: <Redirect to='/' />
			) } />

			<Redirect exact from='/' to='/admin' />
			<PrivateRoute path={ '/admin' } component={ AdminLayout } />

			<LoadingRoute path='/presentation/:id' render={ () => (
				<PresentationLayout>
					<Presentation />
				</PresentationLayout>
			) } />

			{/* Short URL for texts */}
			<Route path='/v/:themeSlug/:memberCode' component={ ShortRoute } />

			<LoadingRoute path={ ['/voting/:id/:member', '/kiosk/:id'] } render={ () => (
				<KioskLayout>
					<Kiosk />
				</KioskLayout>
			) } />

			<LoadingRoute path='/simulation/:id' render={ () => (
				<PresentationLayout>
					<Simulation />
				</PresentationLayout>
			) } />

			<LoadingRoute path='/pledges/:id' render={ () => (
				<KioskLayout>
					<Pledges />
				</KioskLayout>
			) } />

			<Route path='/404' component={ FourOhFour } />

		</Switch>
	</BrowserRouter>
))

export default Routes