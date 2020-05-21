import React from 'react'
import { useParams, Link, useHistory } from 'react-router-dom'
import { useMessage } from '/imports/api/providers'
import { Loader, Container, Segment, Button } from 'semantic-ui-react'
import styled from 'styled-components'
import { useData } from '/imports/api/providers'

import RichTextEditor from '/imports/ui/Components/RichTextEditor'
import { observer } from 'mobx-react-lite'
import { MessageMethods } from '/imports/api/methods'

const MessageEdit = observer(() => {
	const { themeId } = useData()
	const { messageId } = useParams()
	const history = useHistory()
	const { message: message, isLoading: messageLoading } = useMessage(messageId)

	console.log({ themeId, messageId, message, messageLoading })

	const handleUpdate = body => {
		const data = {
			title: message.title,
			subject: message.subject,
			body: message.body
		}

		MessageMethods.update.call({ id: message._id, data }, (err, res) => {
			if(err) {
				console.error(err)
			} else {
				history.push(`/admin/${themeId}/messaging`)
			}
		})
	}

	if(messageLoading) return <Loader active />

	if(!message) return <h1>No Message Found</h1>

	return (
		<Container>
			<h1>
				{ message.title }
				<RightSpan><Link to={ `/admin/${themeId}/messaging` } >&lt;&lt;&nbsp;Back</Link></RightSpan>
			</h1>

			<hr />

			<h2>Subject: <u>{ message.subject }</u></h2>

			<RichTextEditor
				id='messageBody'
				value={ message.body }
				onChange={ body => message.body = body }
			/>
			<Segment><div dangerouslySetInnerHTML={ { __html: message.body } } /></Segment>

			<Button onClick={ handleUpdate }>Save</Button>
		</Container>
	)
})

const RightSpan = styled.span`
	float: right;
`

export default MessageEdit