import React from 'react'
import { useParams, Link, useHistory } from 'react-router-dom'
import { useMessage } from '/imports/api/providers'
import { Loader, Container, Segment, Button, Menu, Dropdown, Form, Input } from 'semantic-ui-react'
import styled from 'styled-components'
import { useData } from '/imports/api/providers'

import RichTextEditor from '/imports/ui/Components/RichTextEditor'
import { observer } from 'mobx-react-lite'
import { MessageMethods } from '/imports/api/methods'

import 'react-quill/dist/quill.snow.css'

const MessageEdit = observer(() => {
	const { themeId } = useData()
	const { messageId } = useParams()
	const history = useHistory()
	const { message: message, isLoading: messageLoading } = useMessage(messageId)

	const handleUpdate = body => {
		message.body = body
		message.dirty = message.body !== message.originalMessage
	}

	const handleSave = () => {
		const data = {
			title: message.title,
			subject: message.subject,
			body: message.body
		}

		MessageMethods.update.call({ id: message._id, data }, (err, res) => {
			if(err) {
				// TODO: User feedback for error
				console.error(err)
			} else {
				history.push(`/admin/${themeId}/settings/messages`)
			}
		})
	}

	if(messageLoading) return <Loader active />

	if(!message) return <h1>No Message Found</h1>

	return (
		<Container>
			<FlexHeading>
				<h1>{ message.title }</h1>
				<div>
					<Menu position='left' direction='right'>
						<Dropdown text='Options' className='link item'>
							<Dropdown.Menu>
								<Dropdown.Item
									disabled={ !message.dirty }
									text='Revert Changes'
									onClick={ () => handleUpdate(message.originalMessage) }
								/>
								<Dropdown.Item text='Delete Message' />
							</Dropdown.Menu>
						</Dropdown>
					</Menu>
				</div>
			</FlexHeading>

			<div style={ { marginBottom: '20px' } }>
				<Form.Field>
					<label>Subject</label>
					<Input fluid value={ message.subject } onChange={ (e, data) => message.subject = data.value } />
				</Form.Field>
			</div>

			<RichTextEditor
				id='messageBody'
				value={ message.body }
				onChange={ handleUpdate }
			/>
			<Preview><div dangerouslySetInnerHTML={ { __html: message.body } } /></Preview>

			<div style={ { textAlign: 'right' } }>
				<Button
					as={ Link }
					to={ `/admin/${themeId}/settings/messages` }
					onClick={ () => handleUpdate(message.originalMessage) }
					color='red'
				>Cancel</Button>
				<Button onClick={ handleSave } disabled={ !message.dirty } color='green'>Save</Button>
			</div>
		</Container>
	)
})

const Preview = styled(Segment)`
	& > div {
		max-width: 600px;
		margin: 0 auto;
	}

	img {
		max-width: 100% !important;
		margin: 4px;
		padding: 4px;
		background-color: #FFF;
		border: solid 1px #CCC;
		border-radius: 2px;
	}
`

const FlexHeading = styled.div`
	display: flex;
	justify-content: space-between;
	flex-wrap: wrap;

	span.full {
		flex: 1;
	}
`

export default MessageEdit
