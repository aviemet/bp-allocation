import React from 'react'
import { useTheme, useMessages } from '/imports/api/providers'
import { Container, Grid, Table, Loader, Segment } from 'semantic-ui-react'
import { MessageMethods } from '/imports/api/methods'
import { Link } from 'react-router-dom'
import EditableText from '/imports/ui/Components/Inputs/EditableText'
import SendWithFeedbackButton from '/imports/ui/Components/Buttons/SendWithFeedbackButton'

const Messages = props => {
	const { theme } = useTheme()
	const { messages, isLoading: messagesLoading } = useMessages()

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
			<Grid>
				<Grid.Row>
					<Grid.Column width={ 8 }>
						<h2>Messages</h2>
					</Grid.Column>

					<Grid.Column width={ 8 }>
						<div style={ { textAlign: 'right' } }><Link to={ `/admin/${theme._id}/settings/messages` }>Message Settings</Link></div>
					</Grid.Column>
				</Grid.Row>
			</Grid>

			<Segment>
				<h1>Texts</h1>
				<Table celled striped>
					<Table.Header>
						<Table.Row>
							<Table.HeaderCell>Title</Table.HeaderCell>
							<Table.HeaderCell>Body</Table.HeaderCell>
							<Table.HeaderCell>Actions</Table.HeaderCell>
						</Table.Row>
					</Table.Header>

					<Table.Body>
						{ messages.values.map(message => {
							if(message.active && message.type === 'text') return (
								<Table.Row key={ message._id }>
									<Table.Cell>
										<EditableText
											onSubmit={ value => handleTextEdits(message._id, { title: value }) }
										>{ message.title }</EditableText>
									</Table.Cell>
									<Table.Cell>
										{ message.body }
									</Table.Cell>
									<Table.Cell singleLine>
										<SendWithFeedbackButton message={ message } />
									</Table.Cell>
								</Table.Row>
							)
						}) }
					</Table.Body>
				</Table>
			</Segment>

			<Segment>
				<h1>Emails</h1>
				<Table celled striped>
					<Table.Header>
						<Table.Row>
							<Table.HeaderCell>Title</Table.HeaderCell>
							<Table.HeaderCell>Subject</Table.HeaderCell>
							<Table.HeaderCell>Actions</Table.HeaderCell>
						</Table.Row>
					</Table.Header>

					<Table.Body>
						{ messages.values.map(message => {
							if(message.active && message.type === 'email') return (
								<Table.Row key={ message._id }>
									<Table.Cell>
										<EditableText
											onSubmit={ value => handleTextEdits(message._id, { title: value }) }
										>{ message.title }</EditableText>
									</Table.Cell>
									<Table.Cell>
										{ message.subject }
									</Table.Cell>
									<Table.Cell singleLine>
										<SendWithFeedbackButton message={ message } />
									</Table.Cell>
								</Table.Row>
							)
						}) }
					</Table.Body>
				</Table>

			</Segment>
		</Container>
	)
}

export default Messages
