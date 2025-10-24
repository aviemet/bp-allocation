import { useMessages } from "/imports/api/providers"
import { MemberMethods } from "/imports/api/methods"
import ExpandLess from "@mui/icons-material/ExpandLess"
import ExpandMore from "@mui/icons-material/ExpandMore"
import OpenInNewIcon from "@mui/icons-material/OpenInNew"
import {
	Box,
	Collapse,
	Divider,
	List,
	MenuItem,
	Stack,
} from "@mui/material"
import { Link } from "@tanstack/react-router"
import PropTypes from "prop-types"
import React, { useState } from "react"

import ConfirmationModal from "/imports/ui/Components/Dialogs/ConfirmDelete"
import ActionMenu from "/imports/ui/Components/Menus/ActionMenu"
import SendWithFeedbackButton from "/imports/ui/Components/Buttons/SendWithFeedbackButton"

const ContextMenu = ({ themeId, member }) => {
	const { messages } = useMessages()

	const [textSubmenuOpen, setTextSubmenuOpen] = useState(false)
	const [emailSubmenuOpen, setEmailSubmenuOpen] = useState(false)

	const [ modalOpen, setModalOpen ] = useState(false)
	const [ modalHeader, setModalHeader ] = useState("")
	const [ modalContent, setModalContent ] = useState("")
	const [ modalAction, setModalAction ] = useState()

	const toggleTextSubmenu = e => {
		setTextSubmenuOpen(!textSubmenuOpen)
		setEmailSubmenuOpen(false)
	}

	const toggleEmailSubmenu = () => {
		setEmailSubmenuOpen(!emailSubmenuOpen)
		setTextSubmenuOpen(false)
	}

	const resetMemberChitVotes = id => () => MemberMethods.resetChitVotes.call(id)
	const resetMemberFundsVotes = id => () => MemberMethods.resetFundsVotes.call(id)

	return (
		<>
			<ActionMenu render={ ActionMenuItem => ([
				/** Edit Menu **/
				<Link
					to={ `/admin/${themeId}/members/${member._id}` }
					key={ `${member._id}-menu-edit` }
				>
					<ActionMenuItem>Edit</ActionMenuItem>
				</Link>,

				<Divider key={ `${member._id}-divider-1` } />,

				/** Member Voting Screen Link **/
				<Link
					to={ `/voting/${themeId}/${member._id}` }
					target="_blank"
					key={ `${member._id}-vote-link` }
				>
					<ActionMenuItem>
						Voting Screen
						<OpenInNewIcon />
					</ActionMenuItem>
				</Link>,

				<Divider key={ `${member._id}-divider-2` } />,

				/** Text Buttons Sub-Menu **/
				<List
					key={ `${member._id}-texts-menu` }
				>
					<MenuItem onClick={ toggleTextSubmenu }>
						Texts
						{ textSubmenuOpen ? <ExpandLess /> : <ExpandMore /> }
					</MenuItem>
					<Collapse in={ textSubmenuOpen } timeout="auto" unmountOnExit>
						<Divider />
						{ messages.values.map((message) => {
							if(message.active && message.type === "text") return (
								<MenuItem key={ `${message._id}-text` } disableRipple>
									<Stack sx={ { width: "100%" } } direction="row" justifyContent="space-between" alignItems="center">
										<Box sx={ { mr: 1 } }>{ message.title }</Box>
										<Box><SendWithFeedbackButton message={ message } members={ [member._id] } /></Box>
									</Stack>
								</MenuItem>
							)
						}) }
					</Collapse>
				</List>,

				<Divider key={ `${member._id}-divider-3` } />,

				/** Email Buttons Sub-Menu **/
				<List
					key={ `${member._id}-emails-menu` }
				>
					<MenuItem onClick={ toggleEmailSubmenu }>
						Emails
						{ emailSubmenuOpen ? <ExpandLess /> : <ExpandMore /> }
					</MenuItem>
					<Collapse in={ emailSubmenuOpen } timeout="auto" unmountOnExit>
						<Divider />
						{ messages.values.map((message) => {
							if(message.active && message.type === "email") return (
								<MenuItem key={ `${message._id}-email` } disableRipple>
									<Stack sx={ { width: "100%" } } direction="row" justifyContent="space-between" alignItems="center">
										<Box sx={ { mr: 1 } }>{ message.title }</Box>
										<Box><SendWithFeedbackButton message={ message } members={ [member._id] } /></Box>
									</Stack>
								</MenuItem>
							)
						}) }
					</Collapse>
				</List>,

				<Divider key={ `${member._id}-divider-4` } />,

				<ActionMenuItem key={ `${member._id}-chit-reset` } onClick={ () => {
					setModalHeader(`Permanently Delete ${member.fullName}'s Chit Votes?`)
					setModalContent(`This will permanently delete the chit votes of ${member.fullName} for this theme. This operation cannot be undone.`)
					setModalAction( () => resetMemberChitVotes(member.theme._id) )
					setModalOpen(true)
				} }>
					Reset Chit Votes
				</ActionMenuItem>,

				<ActionMenuItem key={ `${member._id}-funds-reset` } onClick={ () => {
					setModalHeader(`Permanently Delete ${member.fullName}'s Votes?`)
					setModalContent(`This will permanently delete the funds votes of ${member.fullName} for this theme. This operation cannot be undone.`)
					setModalAction( () => resetMemberFundsVotes(member.theme._id) )
					setModalOpen(true)
				} }>
					Reset Funds Votes
				</ActionMenuItem>,

			]) } />

			<ConfirmationModal
				isModalOpen={ modalOpen }
				handleClose={ () => setModalOpen(false) }
				header={ modalHeader }
				content={ modalContent }
				confirmAction={ modalAction }
			/>
		</>
	)
}

ContextMenu.propTypes = {
	themeId: PropTypes.string.isRequired,
	member: PropTypes.object.isRequired,
}

export default ContextMenu
