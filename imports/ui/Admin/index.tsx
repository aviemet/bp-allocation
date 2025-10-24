import Container from "@mui/material/Container"
import { useParams, Navigate } from "@tanstack/react-router"
import React from "react"


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
} from "/imports/ui/Admin/Panes"

const Admin = () => {
	// Get params safely - only if we're on a route with an ID
	let params = {}
	try {
		params = useParams({ from: "/admin/$id" })
	} catch(error) {
		// We're not on a route with an ID, params will be empty
		params = {}
	}

	// For now, just render the presentation pane
	// In a full implementation, you'd use the params to determine which component to render
	return (
		<Container>
			<PresentationPane />
		</Container>
	)
}

export default Admin
