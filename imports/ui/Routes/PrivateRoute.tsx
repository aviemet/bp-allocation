import { Meteor } from 'meteor/meteor'
import React from 'react'
import { Redirect } from 'wouter'

const PrivatePath = ({ children }: { children: React.ReactNode }) => {
	if(process.env.NODE_ENV !== 'development' && !Meteor.userId()) {
		return <Redirect to='/login' />
	}

	return <>{ children }</>
}

export default PrivatePath
