import Meteor from 'meteor/meteor'
import React from 'react'
import PropTypes from 'react'

import { Grid, Button } from 'semantic-ui-react'




const IndividualFile = ({ fileId, fileName, fileUrl, fileSize }) => {

	const deleteFile = () => {
		let conf = confirm('Are you sure you want to delete the file?') || false
		if(conf) {
			Meteor.call('images.delete', fileId, (err, res) => {
				if (err)
					console.error(err)
			})
		}
	}

	const renameFile = () => {
		let validName = /[^a-zA-Z0-9 .:+()\-_%!&]/gi
		let prompt    = window.prompt('New file name?', fileName)

		// Replace any non valid characters, also do this on the server
		if(prompt) {
			prompt = prompt.replace(validName, '-')
			prompt.trim()
		}

		// if (!_.isEmpty(prompt)) {
		if(typeof prompt === 'string' && prompt !== ''){
			Meteor.call('images.rename', fileId, prompt, function (err, res) {
				if(err) console.error(err)
			})
		}
	}

	return (
		<>
			<Grid.Row>
				<Grid.Column>
					<strong>{ fileName }</strong>
					<div className="m-b-sm">
					</div>
				</Grid.Column>
			</Grid.Row>

			<Grid.Row>
				<Grid.Column>
					<Button onClick={ renameFile }>Rename</Button>
				</Grid.Column>


				<Grid.Column>
					<a href={ fileUrl } target="_blank" rel="noopener noreferrer">View</a>
				</Grid.Column>

				<Grid.Column>
					<Button onClick={ deleteFile }>Delete</Button>
				</Grid.Column>

				<Grid.Column>
          Size: {fileSize}
				</Grid.Column>
			</Grid.Row>
		</>
	)
}

IndividualFile.propTypes = {
	fileId: PropTypes.string,
	fileName: PropTypes.string,
	fileUrl: PropTypes.string,
	fileSize: PropTypes.number
}

export default IndividualFile
