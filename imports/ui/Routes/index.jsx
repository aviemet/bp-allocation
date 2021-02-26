import { Meteor } from 'meteor/meteor'
import React from 'react'
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom'

import PrivateRoute from './PrivateRoute'
import LoadingRoute from './LoadingRoute'
import ShortRoute from './ShortRoute'

import { observer } from 'mobx-react-lite'

import { AdminLayout, WelcomeLayout, PresentationLayout, KioskLayout, FeedbackLayout } from '/imports/ui/Layouts'
import Presentation from '/imports/ui/Presentation'
import Simulation from '/imports/ui/Admin/Simulation'
import Pledges from '/imports/ui/Pledges'
import Login from '/imports/ui/Welcome/Login'
import Kiosk from '/imports/ui/Kiosk'
import Feedback from '/imports/ui/Feedback'
import FourOhFour from './404'

const Routes = observer(() => (
	<BrowserRouter>
		<Switch>

			<Route path='/login' render={ () => (
				!Meteor.userId()
					? <WelcomeLayout><Login /></WelcomeLayout>
					: <Redirect to='/' />
			) } />

			<Redirect exact from='/' to='/themes' />
			<PrivateRoute path={ ['/themes', '/admin'] } component={ AdminLayout } />

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

			<LoadingRoute path='/feedback/:id' render={ () => (
				<FeedbackLayout>
					<Feedback />
				</FeedbackLayout>
			) } />

			<Route path='/404' component={ FourOhFour } />

		</Switch>
	</BrowserRouter>
))

export default Routes