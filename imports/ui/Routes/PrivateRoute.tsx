import { Meteor } from 'meteor/meteor'
import React from 'react'
import { Navigate } from 'react-router-dom'

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
	const isLoggedIn = process.env.NODE_ENV === 'development' || Meteor.userId()

	if(!isLoggedIn) return <Navigate to='/login' />
	return <>{ children }</>
}

export default PrivateRoute
