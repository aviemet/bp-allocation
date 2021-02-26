import React from 'react'
import { useTheme, useMessages } from '/imports/api/providers'
import { Container, Grid, Table, Loader, Segment } from 'semantic-ui-react'
import { MessageMethods } from '/imports/api/methods'
import EditableText from '/imports/ui/Components/Inputs/EditableText'
import TextMembersButton from '/imports/ui/Components/Buttons/TextMembersButton'
import EmailMembersButton from '/imports/ui/Components/Buttons/EmailMembersButton'

const Messages = props => {
	const { messagesStatus } = useTheme()
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
			<Segment>
				<Grid>
					<Grid.Row>
						<Grid.Column width={ 8 }>
							<h2>Messages</h2>
						</Grid.Column>
					</Grid.Row>
				</Grid>

				<Table celled striped>
					<Table.Header>
						<Table.Row>
							<Table.HeaderCell>Type</Table.HeaderCell>
							<Table.HeaderCell>Title</Table.HeaderCell>
							<Table.HeaderCell>Message</Table.HeaderCell>
							<Table.HeaderCell>Actions</Table.HeaderCell>
						</Table.Row>
					</Table.Header>

					<Table.Body>
						{ messages.values.map(message => (
							<Table.Row key={ message._id }>
								<Table.Cell>
									{ message.type }
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
								<Table.Cell singleLine>
									{ message.type === 'email' ? <EmailMembersButton message={ message } /> : <TextMembersButton message={ message } /> }
								</Table.Cell>
							</Table.Row>
						))
						}
					</Table.Body>
				</Table>
			</Segment>
		</Container>
	)
}

export default Messages
