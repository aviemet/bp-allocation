import React from 'react';
import RichTextEditor from '/imports/ui/Components/RichTextEditor';
import TextMembersButton from '/imports/ui/Components/TextMembersButton';
import { useMessages } from '/imports/api/providers';
import { Container, Grid, Table, Dropdown, Loader, Button, Icon } from 'semantic-ui-react';

const Messages = props => {
	const { messages, isLoading: messagesLoading } = useMessages();

	if(messagesLoading) return <Loader active />;

	return (
		<Container>

			<Grid>
				<Grid.Row>

					<Grid.Column width={ 8 }>
						<h2>Texts</h2>
					</Grid.Column>

					<Grid.Column width={ 8 } textAlign='right'>
						<Button>+ New Text Message</Button>
					</Grid.Column>
				</Grid.Row>
			</Grid>

			<Table>
				<Table.Header>
					<Table.Row>
						<Table.HeaderCell>Title</Table.HeaderCell>
						<Table.HeaderCell>Message</Table.HeaderCell>
						<Table.HeaderCell>Actions</Table.HeaderCell>
					</Table.Row>
				</Table.Header>

				<Table.Body>
					{ messages.values.map((message, i) => {
						if(message.type === 'text') {
							return (
								<Table.Row key={ i }>
									<Table.Cell>{ message.title }</Table.Cell>
									<Table.Cell>{ message.body }</Table.Cell>
									<Table.Cell singleLine>
									
										<Dropdown text='Actions' className='link item' direction='left'>
											<Dropdown.Menu>
												<Dropdown.Item onClick={ () => console.log('edit') }>Edit</Dropdown.Item>
												<Dropdown.Divider />
												<Dropdown.Item onClick={ () => {
													console.log('delete')
												} } ><Icon name='trash' />Delete Theme</Dropdown.Item>
											</Dropdown.Menu>
										</Dropdown>

									</Table.Cell>
								</Table.Row>
							);
						}
					} ) }
				</Table.Body>
			</Table>

			<hr />

			<Grid>
				<Grid.Row>

					<Grid.Column width={ 8 }>
						<h2>Emails</h2>
					</Grid.Column>

					<Grid.Column width={ 8 } textAlign='right'>
						<Button>+ New Email Message</Button>
					</Grid.Column>
				</Grid.Row>
			</Grid>

			<Table>
				<Table.Header>
					<Table.Row>
						<Table.HeaderCell>Title</Table.HeaderCell>
						<Table.HeaderCell>Subject</Table.HeaderCell>
						<Table.HeaderCell>Message</Table.HeaderCell>
						<Table.HeaderCell>Actions</Table.HeaderCell>
					</Table.Row>
				</Table.Header>

				<Table.Body>
					{ messages.values.map((message, i) => {
						if(message.type === 'email') {
							return (
								<Table.Row key={ i }>
									<Table.Cell>{ message.title }</Table.Cell>
									<Table.Cell>{ message.subject }</Table.Cell>
									<Table.Cell>{ message.body }</Table.Cell>
									<Table.Cell></Table.Cell>
								</Table.Row>
							);
						}
					} ) }
				</Table.Body>
			</Table>

			<hr />

			<TextMembersButton
				message="From Battery Powered: Excuse us! We sent a bad link. The finalists can be seen here http://bit.ly/2TECprF Voting starts later tonight!"
				title='Voting to Start Later'
				link={ false }
			/>
		</Container>
	);
};

export default Messages;