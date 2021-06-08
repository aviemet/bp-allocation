import React, { useState } from 'react'
import PropTypes from 'prop-types'

import { MemberMethods } from '/imports/api/methods'
import ConfirmationModal from '/imports/ui/Components/Modals/ConfirmationModal'
import SendWithFeedbackButton from '/imports/ui/Components/Buttons/SendWithFeedbackButton'

import { Icon, Dropdown } from 'semantic-ui-react'
import styled from 'styled-components'

const ActionsDropdownMenu = ({ theme, member, messages }) => {
	const [ modalOpen, setModalOpen ] = useState(false)
	const [ modalHeader, setModalHeader ] = useState('')
	const [ modalContent, setModalContent ] = useState('')
	const [ modalAction, setModalAction ] = useState()

	const removeMember = id => () => {
		MemberMethods.removeMemberFromTheme.call({ memberId: id, themeId: theme._id })
	}

	const resetMemberChitVotes = id => () => MemberMethods.resetChitVotes.call(id)
	const resetMemberFundsVotes = id => () => MemberMethods.resetFundsVotes.call(id)

	return (
		<>
			<Dropdown text='Actions' className='link item' direction='left'>
				<Dropdown.Menu>
					<Dropdown.Item onClick={ () => window.open(`/voting/${theme._id}/${member._id}`) }>Voting Screen <Icon name='external' /></Dropdown.Item>

					<Dropdown.Divider />

					<Dropdown.Item>
						<Dropdown text='Texts'>
							<Dropdown.Menu>{ messages.values.map((message, i) => {
								if(message.active && message.type === 'text') return (
									<Dropdown.Item key={ i }>
										<MessageButtonContainer>
											<div style={ { marginRight: '4px' } }>{ message.title }</div>
											<div><SendWithFeedbackButton message={ message } members={ [member._id] } /></div>
										</MessageButtonContainer>
									</Dropdown.Item>
								)
							}) }</Dropdown.Menu>
						</Dropdown>
					</Dropdown.Item>

					<Dropdown.Item>
						<Dropdown text='Emails'>
							<Dropdown.Menu direction='left'>{ messages.values.map((message, i) => {
								if(message.active && message.type === 'email') return (
									<Dropdown.Item key={ i }>
										<MessageButtonContainer>
											<div style={ { marginRight: '4px' } }>{ message.title }</div>
											<div><SendWithFeedbackButton message={ message } members={ [member._id] } /></div>
										</MessageButtonContainer>
									</Dropdown.Item>
								)
							}) }</Dropdown.Menu>
						</Dropdown>
					</Dropdown.Item>

					<Dropdown.Divider />

					<Dropdown.Item onClick={ () => {
						setModalHeader(`Permanently Delete ${member.fullName}'s Chit Votes?`)
						setModalContent(`This will permanently delete the chit votes of ${member.fullName} for this theme. This operation cannot be undone.`)
						setModalAction( () => resetMemberChitVotes(member.theme._id) )
						setModalOpen(true)
					} }>Reset Chit Votes</Dropdown.Item>
					<Dropdown.Item onClick={ () => {
						setModalHeader(`Permanently Delete ${member.fullName}'s Votes?`)
						setModalContent(`This will permanently delete the funds votes of ${member.fullName} for this theme. This operation cannot be undone.`)
						setModalAction( () => resetMemberFundsVotes(member.theme._id) )
						setModalOpen(true)
					} }>Reset Funds Votes</Dropdown.Item>

					<Dropdown.Divider />

					<Dropdown.Item onClick={ () => {
						setModalHeader(`Permanently Unlink ${member.fullName} From This Theme?`)
						setModalContent(`This will permanently remove ${member.fullName} from this theme. It will not remove the Member record.`)
						setModalAction( () => removeMember(member._id) )
						setModalOpen(true)
					} } ><Icon name='trash' />Remove From Theme</Dropdown.Item>
				</Dropdown.Menu>
			</Dropdown>

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

ActionsDropdownMenu.propTypes = {
	theme: PropTypes.object,
	member: PropTypes.object,
	messages: PropTypes.object
}

const MessageButtonContainer = styled.div`
	display: 'flex'; 
	justify-content: 'space-between';
	align-items: 'center';
`

export default ActionsDropdownMenu
