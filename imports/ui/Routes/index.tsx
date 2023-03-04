import { Meteor } from 'meteor/meteor'
import React from 'react'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
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

const AppRoutes = observer(() => (
	<BrowserRouter>
		<Routes>

			<Route path='/login' element={
				!Meteor.userId()
					?
					<><WelcomeLayout><Login /></WelcomeLayout></>
					:
					<Navigate to='/' />
			} />

			<Route path='/' element={ <Navigate to='/admin' /> } />

			<Route path='/admin' element={
				process.env.NODE_ENV !== 'development' && !Meteor.userId()
					?
					<Navigate to='/login' />
					:
					<AdminLayout />
			} />

			<LoadingRoute path='/presentation/:id'>
				<PresentationLayout>
					<Presentation />
				</PresentationLayout>
			</LoadingRoute>

			{ /* Short URL for texts */ }
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

			<Route path='/404' element={ <FourOhFour /> } />
		</Routes>
	</BrowserRouter>
))

export default AppRoutes
