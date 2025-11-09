import {
	Button,
	Grid,
	Stack,
	TextField,
} from "@mui/material"
import { useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { Controller, useFormContext } from "react-hook-form"

import { Form, TextInput, SubmitButton, STATUS } from "/imports/ui/components/Form"
import ContentModal from "/imports/ui/components/Dialogs/ContentModal"
import { ThemeMethods } from "/imports/api/methods"
import { ThemeSchema } from "/imports/api/db"

const ThemeInputs = () => {
	const { control, formState: { errors } } = useFormContext()

	return (
		<Grid container spacing={ 2 }>
			<Grid size={ { xs: 12 } }>
				<Controller
					name="title"
					control={ control }
					render={ ({ field }) => (
						<TextField
							{ ...field }
							label="Theme Title"
							fullWidth
							error={ !!errors.title }
							helperText={ errors.title && errors.title.message }
						/>
					) }
				/>
			</Grid>

			<Grid size={ { xs: 12 } }>
				<Controller
					name="question"
					control={ control }
					render={ ({ field }) => (
						<TextField
							{ ...field }
							label="Theme Question"
							fullWidth
							error={ !!errors.question }
							helperText={ errors.question && errors.question.message }
						/>
					) }
				/>
			</Grid>

			<Grid size={ { xs: 12 } }>
				<Button type="submit">Submit</Button>
			</Grid>
		</Grid>
	)
}

const NewThemeModal = () => {
	const navigate = useNavigate()

	const [isModalOpen, setIsModalOpen] = useState(false)
	const [formStatus, setFormStatus] = useState(STATUS.READY)

	const onSubmit = async data => {
		setFormStatus(STATUS.SUBMITTING)
		try {
			const res = await ThemeMethods.create.callAsync(data)
			setFormStatus(STATUS.SUCCESS)
			setIsModalOpen(false)
			navigate({ to: `/admin/${res}` })
		} catch(err) {
			setFormStatus(STATUS.ERROR)
			console.error(err)
		}
	}

	return (
		<>
			<Button onClick={ () => setIsModalOpen(true) }>+ New Theme</Button>
			<ContentModal
				open={ isModalOpen }
				setOpen={ setIsModalOpen }
				title="Create New Battery Powered Theme"
			>
				<Form
					schema={ ThemeSchema }
					defaultValues={ {
						title: "",
						question: "",
					} }
					onValidSubmit={ onSubmit }
				>
					<Grid container spacing={ 2 }>
						<Grid size={ { xs: 12 } }>
							<TextInput name="title" label="Theme Title" required />
						</Grid>

						<Grid size={ { xs: 12 } }>
							<TextInput name="question" label="Theme Question" />
						</Grid>

						<Grid size={ { xs: 12 } }>
							<Stack direction="row" spacing={ 2 } justifyContent="end">
								<Button color="error" onClick={ () => setIsModalOpen(false) }>Cancel</Button>
								<SubmitButton type="submit" status={ formStatus } setStatus={ setFormStatus }>Save Theme</SubmitButton>
							</Stack>
						</Grid>
					</Grid>
				</Form>
			</ContentModal>
		</>
	)
}
/*
const NewThemeModal = props => {
	const [ isModalOpen, setIsModalOpen ] = useState(false)
	const [ newThemeTitle, setNewThemeTitle ] = useState('')
	const [ newThemeQuestion, setNewThemeQuestion ] = useState('')
	// const [ newThemeQuarter, setNewThemeQuarter ] = useState('')

	const createNewTheme = async e => {
		e.preventDefault()

		try {
			await ThemeMethods.create.callAsync({
				title: newThemeTitle,
				question: newThemeQuestion,
				// quarter: newThemeQuarter
			})
			setIsModalOpen(false)
		} catch(err) {
			console.error(err)
		}
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
*/
export default NewThemeModal

