import { Navigate } from "@tanstack/react-router"
import { Meteor } from "meteor/meteor"
import React from "react"
import { AdminLayout } from "/imports/ui/Layouts"

const AdminRoute = () => {
	if(process.env.NODE_ENV !== "development" && !Meteor.userId()) {
		return <Navigate to="/login" />
	}

	return <AdminLayout />
}

export default AdminRoute
