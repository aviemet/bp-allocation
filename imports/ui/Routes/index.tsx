import { Meteor } from 'meteor/meteor'
import React from 'react'
import { Navigate, createBrowserRouter, RouterProvider } from 'react-router-dom'
import ShortRoute from './ShortRoute'
import { observer } from 'mobx-react-lite'
import { AdminLayout, WelcomeLayout, PresentationLayout, KioskLayout } from '/imports/ui/Layouts'
import Presentation from '/imports/ui/Presentation'
import Simulation from '/imports/ui/Admin/Simulation'
import Pledges from '/imports/ui/Pledges'
import Login from '/imports/ui/Welcome/Login'
import Kiosk from '/imports/ui/Kiosk'
import FourOhFour from './404'
import ThemesList from '../Admin/ThemesList'
import Admin from '../Admin'

const router = createBrowserRouter([
	{
		path: '/',
		element: <Navigate to='/admin' />,
	},
	{
		path: '/login',
		element: !Meteor.userId()
			?
			<><WelcomeLayout><Login /></WelcomeLayout></>
			:
			<Navigate to='/' />,
	},
	{
		path: '/admin',
		element: process.env.NODE_ENV !== 'development' && !Meteor.userId()
			?
			<Navigate to='/login' />
			:
			<AdminLayout />,
		children:[
			{
				path: '',
				element: <ThemesList />,
			},
			{
				path: '/',
				element: <Admin />,
			},
		],
	},
	{
		path: '/presentation/:id',
		element:
		<PresentationLayout>
			<Presentation />
		</PresentationLayout>,
	},
	{
		path: '/v/:themeSlug/:memberCode',
		element: <ShortRoute />,
	},
	{
		path: '/voting/:id/:member',
		element:
		<KioskLayout>
			<Kiosk />
		</KioskLayout>,
	},
	{
		path: '/kiosk/:id',
		// loader:
		element:
		<KioskLayout>
			<Kiosk />
		</KioskLayout>,
	},
	{
		path: '/simulation/:id',
		// loader:
		element: <PresentationLayout>
			<Simulation />
		</PresentationLayout>,
	},
	{
		path: '/pledges/:id',
		// loader:
		element:
		<KioskLayout>
			<Pledges />
		</KioskLayout>,
	},
])

const AppRoutes = () => <RouterProvider router={ router } />


/*
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
*/

export default AppRoutes
