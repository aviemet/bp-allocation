import React, { useState } from 'react'
import { Button, Modal, Form, Input } from 'semantic-ui-react'

import { ThemeMethods } from '/imports/api/methods'

const NewThemeModal = props => {
	const [ isModalOpen, setIsModalOpen ] = useState(false)
	const [ newThemeTitle, setNewThemeTitle ] = useState('')
	const [ newThemeQuestion, setNewThemeQuestion ] = useState('')
	// const [ newThemeQuarter, setNewThemeQuarter ] = useState('')

	const createNewTheme = e => {
		e.preventDefault()

		ThemeMethods.create.call({
			title: newThemeTitle,
			question: newThemeQuestion,
			// quarter: newThemeQuarter
		}, (err, res) => {
			if(err) {
				console.error(err)
			} else {
				setIsModalOpen(false)
			}
		})
	}

	const clearInputs = () => {
		setNewThemeTitle('')
		setNewThemeQuestion('')
		// setNewThemeQuarter('')
		setIsModalOpen(false)
	}

	return (
		<Modal 
			trigger={ <Button onClick={ () => setIsModalOpen(true) }>+ New Theme</Button> } 
			centered={ false } 
			open={ isModalOpen } 
			onClose={ () => setIsModalOpen(false) }
		>
			<Modal.Header>Create New Battery Powered Theme</Modal.Header>
			<Modal.Content>
				<Modal.Description>
					<Form onSubmit={ createNewTheme }>
						<Form.Field>
							<label htmlFor="newThemeTitle">Battery Powered Theme Title</label>
							<Input 
								placeholder='e.g. Conservation' 
								id='newThemeTitle'
								value={ newThemeTitle } 
								onChange={ e => setNewThemeTitle(e.target.value) } 
							/>
						</Form.Field>
						<Form.Field>
							<label htmlFor='newThemeQuestion'>Theme Question</label>
							<Input 
								placeholder='e.g.' 
								id='newThemeQuestion'
								value={ newThemeQuestion } 
								onChange={ e => setNewThemeQuestion(e.target.value) } 
							/>
						</Form.Field>
						<div align='right'>
							<Button type='button' onClick={ clearInputs } color='red'>Cancel</Button>
							<Button type='submit' color='green'>Save New Theme</Button>
						</div>
					</Form>
				</Modal.Description>
			</Modal.Content>
		</Modal>
	)
}

export default NewThemeModal

/*
<Form.Field>
	<label htmlFor="newThemeQuarter">Fiscal Quarter</label>
	<Input 
		placeholder='e.g. 2018Q3' 
		id="newThemeQuarter"
		value={ newThemeQuarter } 
		onChange={ e => setNewThemeQuarter(e.target.value) } 
	/>
</Form.Field>
*/