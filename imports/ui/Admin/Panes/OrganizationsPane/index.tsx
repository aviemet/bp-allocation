import DeleteIcon from "@mui/icons-material/Delete"
import EditIcon from "@mui/icons-material/Edit"
import MoreVertIcon from "@mui/icons-material/MoreVert"
import {
	Card,
	CardContent,
	CardHeader,
	Container,
	Divider,
	Grid,
	IconButton,
	Menu,
	MenuItem,
	Typography,
} from "@mui/material"
import { styled, alpha } from "@mui/material/styles"
import { Link, useParams, useNavigate } from "@tanstack/react-router"
import PopupState, { bindTrigger, bindMenu } from "material-ui-popup-state"
import { observer } from "mobx-react-lite"
import numeral from "numeral"
import React, { useState, useRef } from "react"
import { useOrgs } from "/imports/api/providers"
import { type Organization } from "/imports/types/schema"

import { OrganizationMethods } from "/imports/api/methods"

import ConfirmationModal from "/imports/ui/Components/Dialogs/ConfirmDelete"
import SplitButton from "/imports/ui/Components/Buttons/SplitButton"
import DisplayHtml from "/imports/ui/Components/DisplayHtml"
import { Loading } from "/imports/ui/Components"

const OrganizationsPane = observer(() => {
	const { orgs, isLoading: orgsLoading } = useOrgs()

	const modalValuesRef = useRef<{ header: string, content: string, action: () => void }>({
		header: "",
		content: "",
		action: () => {},
	})

	const [ modalOpen, setModalOpen ] = useState(false)

	const { id } = useParams({ strict: false })
	const navigate = useNavigate()

	const showDeleteModal = (org: Organization) => {
		modalValuesRef.current.header = "Permanently Delete This Organization?"
		modalValuesRef.current.content = `This will permanently remove ${org.title} from this theme and all associated data. This process cannot be undone.`
		modalValuesRef.current.action = () => {
			OrganizationMethods.remove.call(org._id, (err, res) => {
				if(err) console.error(err)
			})
		}
		setModalOpen(true)
	}

	if(orgsLoading || !orgs) return <Loading />

	const options: { title: string, action: () => void }[] = [
		{
			title: "Add New Organization",
			action: () => navigate({ to: "/admin/$id/orgs/new", params: { id: String(id) } }),
		},
		{
			title: "Import From CSV",
			action: () => navigate({ to: "/admin/$id/orgs/import", params: { id: String(id) } }),
		},
	]

	return (
		<>
			<Container>
				<Grid container spacing={ 4 }>
					<Grid item xs={ 12 } md={ 8 }>
						<Typography component="h1" variant="h3">
							Organizations
						</Typography>
					</Grid>
					<Grid item xs={ 12 } md={ 4 } sx={ { textAlign: "right" } }>
						<SplitButton options={ options } />
					</Grid>
				</Grid>

				{ orgs.values.map(org => (
					<Card key={ org._id } sx={ { mb: 2 } }>
						<CardHeader
							action={
								<PopupState variant="popover" popupId={ `org-${org._id}-options` }>
									{ popupState => (
										<>
											<IconButton { ...bindTrigger(popupState) }>
												<MoreVertIcon />
											</IconButton>
											<StyledMenu
												{ ...bindMenu(popupState) }
												anchorOrigin={ {
													vertical: "bottom",
													horizontal: "right",
												} }
												transformOrigin={ {
													vertical: "top",
													horizontal: "right",
												} }
											>
												<Link to="/admin/$id/orgs/$orgId" params={ { id: String(id), orgId: String(org._id) } }>
													<MenuItem onClick={ popupState.close } disableRipple>
														<EditIcon />
														Edit
													</MenuItem>
												</Link>
												<Divider />
												<MenuItem disableRipple onClick={ () => {
													showDeleteModal(org)
													popupState.close()
												} }>
													<DeleteIcon />
													Delete
												</MenuItem>
											</StyledMenu>
										</>
									) }
								</PopupState>
							}
							title={ String((org as any).title ?? "") }
							subheader={ `Ask: ${numeral(Number((org as any).ask ?? 0)).format("$0,0")}` }
						/>
						<CardContent>
							<DisplayHtml>{ String((org as any).description ?? "") }</DisplayHtml>
						</CardContent>
					</Card>
				)) }
			</Container>

			<ConfirmationModal
				isModalOpen={ modalOpen }
				handleClose={ () => setModalOpen(false) }
				header={ modalValuesRef.current.header }
				content={ modalValuesRef.current.content }
				confirmAction={ modalValuesRef.current.action }
			/>
		</>
	)
})

const StyledMenu = styled(Menu)(({ theme }) => ({
	"& .MuiPaper-root": {
		borderRadius: 6,
		marginTop: theme.spacing(1),
		minWidth: 180,
		color:
      theme.palette.mode === "light" ? "rgb(55, 65, 81)" : theme.palette.grey[300],
		boxShadow:
      "rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px",
		"& .MuiMenu-list": {
			padding: "4px 0",
		},
		"& .MuiMenuItem-root": {
			"& .MuiSvgIcon-root": {
				fontSize: 18,
				color: theme.palette.text.secondary,
				marginRight: theme.spacing(1.5),
			},
			"&:active": {
				backgroundColor: alpha(
					theme.palette.primary.main,
					theme.palette.action.selectedOpacity,
				),
			},
		},
	},
}))

export default OrganizationsPane
