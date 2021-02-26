import { Meteor } from 'meteor/meteor'
import React, { useState } from 'react'
import TextEditModal from './TextEditModal'
import EmailEditModal from './EmailEditModal'
import { useData, useMessages } from '/imports/api/providers'
import { Container, Grid, Table, Dropdown, Loader, Icon, Segment } from 'semantic-ui-react'
import { MessageMethods } from '/imports/api/methods'
import IncludeVotingLinkToggle from './IncludevotingLinkToggle'
import ActiveToggle from './ActiveToggle'
import ConfirmationModal from '/imports/ui/Components/Modals/ConfirmationModal'
import { Link, useLocation, useHistory } from 'react-router-dom'
import EditableText from '/imports/ui/Components/Inputs/EditableText'

const Messages = props => {
	const { themeId } = useData()
	const { messages, isLoading: messagesLoading } = useMessages()

	const [ modalOpen, setModalOpen ] = useState(false)
	const [ modalHeader, setModalHeader ] = useState('')
	const [ modalContent, setModalContent ] = useState('')
	const [ modalAction, setModalAction ] = useState()

	const { pathname } = useLocation()
	const history = useHistory()

	const deleteMessage = id => () => MessageMethods.remove.call(id)

	const handleTextEdits = (id, data) => {
		MessageMethods.update.call({ id, data }, err => {
			if(err) {
				console.error(err)
			}
		})
	}

	if(messagesLoading) return <Loader active />

	return (
		<Container>
			<Segment>
				<Grid>
					<Grid.Row>

						<Grid.Column width={ 8 }>
							<h2>Texts</h2>
						</Grid.Column>

						<Grid.Column width={ 8 } textAlign='right'>
							<TextEditModal
								buttonText='+ New Text Message'
								messageType='text'
							/>
						</Grid.Column>
					</Grid.Row>
				</Grid>

				{/* Text Message Table */}
				<Table celled striped>
					<Table.Header>
						<Table.Row>
							<Table.HeaderCell>Active</Table.HeaderCell>
							<Table.HeaderCell>Title</Table.HeaderCell>
							<Table.HeaderCell>Message</Table.HeaderCell>
							<Table.HeaderCell>Include Link</Table.HeaderCell>
							<Table.HeaderCell>Actions</Table.HeaderCell>
						</Table.Row>
					</Table.Header>

					<Table.Body>
						{ messages.values.map((message, i) => {
							if(message.type === 'text') {
								return (
									<Table.Row key={ i }>
										<Table.Cell>
											<ActiveToggle message={ message } />
										</Table.Cell>
										<Table.Cell>
											<EditableText
												onSubmit={ value => handleTextEdits(message._id, { title: value }) }
											>{ message.title }</EditableText>
										</Table.Cell>
										<Table.Cell>
											<EditableText
												type='textarea'
												onSubmit={ value => handleTextEdits(message._id, { body: value }) }
											>
												{ message.body }
											</EditableText>
										</Table.Cell>
										<Table.Cell>
											<IncludeVotingLinkToggle message={ message } />
										</Table.Cell>
										<Table.Cell singleLine>

											<Dropdown text='Actions' className='link item' direction='left'>
												<Dropdown.Menu>
													<Dropdown.Item onClick={ () => {
														Meteor.call('textVotingLinkToMembers', { themeId, message })
													} }>Send</Dropdown.Item>

													<Dropdown.Divider />

													<Dropdown.Item onClick={ () => {
														setModalHeader('Permanently Delete This Text Message Template?')
														setModalContent(`This will permanently remove ${message.title}.`)
														setModalAction( () => deleteMessage(message._id) )
														setModalOpen(true)
													} } ><Icon name='trash' />Delete Theme</Dropdown.Item>

												</Dropdown.Menu>
											</Dropdown>

										</Table.Cell>
									</Table.Row>
								)
							}
						} ) }
					</Table.Body>
				</Table>
			</Segment>

			<br />

			<Segment>
				<Grid>
					<Grid.Row>

						<Grid.Column width={ 8 }>
							<h2>Emails</h2>
						</Grid.Column>

						<Grid.Column width={ 8 } textAlign='right'>
							<EmailEditModal
								buttonText='+ New Email Message'
							/>
						</Grid.Column>
					</Grid.Row>
				</Grid>

				{/* Email Message Table */}
				<Table celled striped>
					<Table.Header>
						<Table.Row>
							<Table.HeaderCell>Active</Table.HeaderCell>
							<Table.HeaderCell>Title</Table.HeaderCell>
							<Table.HeaderCell>Subject</Table.HeaderCell>
							<Table.HeaderCell>Include Link</Table.HeaderCell>
							<Table.HeaderCell>Actions</Table.HeaderCell>
						</Table.Row>
					</Table.Header>

					<Table.Body>
						{ messages.values.map((message, i) => {
							if(message.type === 'email') {
								return (
									<Table.Row key={ i }>
										<Table.Cell>
											<ActiveToggle message={ message } />
										</Table.Cell>
										<Table.Cell><Link to={ `${pathname}/${message._id}` }>{ message.title }</Link></Table.Cell>
										<Table.Cell>{ message.subject }</Table.Cell>
										<Table.Cell>
											<IncludeVotingLinkToggle message={ message } />
										</Table.Cell>
										<Table.Cell singleLine>

											<Dropdown text='Actions' className='link item' direction='left'>
												<Dropdown.Menu>
													<Dropdown.Item onClick={ () => history.push(`${pathname}/${message._id}`) }>Preview/Edit</Dropdown.Item>

													<Dropdown.Item onClick={ () => {
														Meteor.call('emailVotingLinkToMembers', { themeId, message })
													} }>Send</Dropdown.Item>

													<Dropdown.Divider />

													<Dropdown.Item onClick={ () => {
														MessageMethods.remove.call(message._id)
													} } ><Icon name='trash' />Delete Message</Dropdown.Item>

												</Dropdown.Menu>
											</Dropdown>

										</Table.Cell>
									</Table.Row>
								)
							}
						} ) }
					</Table.Body>
				</Table>
			</Segment>

			<br />

			<ConfirmationModal
				isModalOpen={ modalOpen }
				handleClose={ () => setModalOpen(false) }
				header={ modalHeader }
				content={ modalContent }
				confirmAction={ modalAction }
			/>
		</Container>
	)
}

export default Messages