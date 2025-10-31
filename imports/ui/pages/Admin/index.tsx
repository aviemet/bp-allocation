import Container from "@mui/material/Container"
import { useParams, useLocation } from "@tanstack/react-router"

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
} from "./Panes"

const Admin = () => {
	const location = useLocation()
	const params = useParams({ strict: false })

	// Extract the path segments to determine which component to render
	const pathSegments = location.pathname.split("/").filter(Boolean)

	// Handle different admin routes
	if(pathSegments.length >= 3) {
		const [, , page] = pathSegments

		switch(page) {
			case "orgs":
				if(pathSegments[3] === "import") {
					return (
						<Container>
							<OrganizationsImport />
						</Container>
					)
				}
				if(pathSegments[3] === "new" || pathSegments[3]) {
					return (
						<Container>
							<OrganizationsEdit />
						</Container>
					)
				}
				return (
					<Container>
						<OrganizationsPane />
					</Container>
				)

			case "members":
				if(pathSegments[3] === "import") {
					return (
						<Container>
							<MembersImport />
						</Container>
					)
				}
				if(pathSegments[3] === "new" || pathSegments[3]) {
					return (
						<Container>
							<MembersEdit />
						</Container>
					)
				}
				return (
					<Container>
						<MembersPane />
					</Container>
				)

			case "chits":
				return (
					<Container>
						<ChitVotingPane />
					</Container>
				)

			case "allocation":
				return (
					<Container>
						<AllocationPane />
					</Container>
				)

			case "pledges":
				return (
					<Container>
						<PledgesPane />
					</Container>
				)

			case "leverage":
				return (
					<Container>
						<LeveragePane />
					</Container>
				)

			case "messaging":
				return (
					<Container>
						<MessagingPane />
					</Container>
				)

			case "overview":
				return (
					<Container>
						<OverviewPane />
					</Container>
				)

			case "settings":
				if(pathSegments[3] === "messages") {
					if(pathSegments[4] === "new") {
						return (
							<Container>
								<MessageEdit />
							</Container>
						)
					}
					if(pathSegments[4]) {
						return (
							<Container>
								<MessageEdit />
							</Container>
						)
					}
				}
				return (
					<Container>
						<SettingsPane />
					</Container>
				)

			case "presentation":
			default:
				return (
					<Container>
						<PresentationPane />
					</Container>
				)
		}
	}

	// Default to presentation pane
	return (
		<Container>
			<PresentationPane />
		</Container>
	)
}

export default Admin
