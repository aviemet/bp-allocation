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
import { observer } from "mobx-react-lite"
import numeral from "numeral"
import React, { useState, useRef } from "react"
import { useOrgs } from "/imports/api/providers"
import { type Organization } from "/imports/types/schema"

import { OrganizationMethods } from "/imports/api/methods"

import ConfirmationModal from "/imports/ui/components/Dialogs/ConfirmDelete"
import SplitButton from "/imports/ui/components/Buttons/SplitButton"
import DisplayHtml from "/imports/ui/components/DisplayHtml"
import { Loading } from "/imports/ui/components"

interface OrgCardProps {
	org: Organization
	id: string
	onDelete: () => void
}

const OrgCard = ({ org, id, onDelete }: OrgCardProps) => {
	const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
	const open = Boolean(anchorEl)

	const handleClick = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget)
	}

	const handleClose = () => {
		setAnchorEl(null)
	}

	return (
		<Card sx={ { mb: 2 } }>
			<CardHeader
				action={
					<>
						<IconButton
							onClick={ handleClick }
							aria-controls={ open ? `org-${org._id}-options` : undefined }
							aria-haspopup="true"
							aria-expanded={ open ? "true" : undefined }
						>
							<MoreVertIcon />
						</IconButton>
						<StyledMenu
							id={ `org-${org._id}-options` }
							anchorEl={ anchorEl }
							open={ open }
							onClose={ handleClose }
							anchorOrigin={ {
								vertical: "bottom",
								horizontal: "right",
							} }
							transformOrigin={ {
								vertical: "top",
								horizontal: "right",
							} }
						>
							<Link to="/admin/$id/orgs/$orgId" params={ { id, orgId: String(org._id) } }>
								<MenuItem onClick={ handleClose } disableRipple>
									<EditIcon />
									Edit
								</MenuItem>
							</Link>
							<Divider />
							<MenuItem
								disableRipple
								onClick={ () => {
									onDelete()
									handleClose()
								} }
							>
								<DeleteIcon />
								Delete
							</MenuItem>
						</StyledMenu>
					</>
				}
				title={ String((org as any).title ?? "") }
				subheader={ `Ask: ${numeral(Number((org as any).ask ?? 0)).format("$0,0")}` }
			/>
			<CardContent>
				<DisplayHtml>{ String((org as any).description ?? "") }</DisplayHtml>
			</CardContent>
		</Card>
	)
}

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
					<Grid size={ { xs: 12, md: 8 } }>
						<Typography component="h1" variant="h3">
							Organizations
						</Typography>
					</Grid>
					<Grid size={ { xs: 12, md: 4 } } sx={ { textAlign: "right" } }>
						<SplitButton options={ options } />
					</Grid>
				</Grid>

				{ orgs.values.map(org => (
					<OrgCard
						key={ org._id }
						org={ org }
						id={ String(id) }
						onDelete={ () => showDeleteModal(org) }
					/>
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
