import React, { useState } from 'react'
import { Button, Grid, Stack } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { Form, TextInput, SubmitButton, STATUS } from '/imports/ui/Components/Form'
import ContentModal from '/imports/ui/Components/Dialogs/ContentModal'
import { ThemeMethods } from '/imports/api/methods'
import { ThemeSchema } from '/imports/api/db/schema'

type NewThemeFormValues = {
	title: string
	question: string
}

const NewThemeModal = () => {
	const navigate = useNavigate()

	const [isModalOpen, setIsModalOpen] = useState(false)
	const [formStatus, setFormStatus] = useState<typeof STATUS[keyof typeof STATUS]>(STATUS.READY)

	const onSubmit = (data: NewThemeFormValues) => {
		setFormStatus(STATUS.SUBMITTING)
		ThemeMethods.create.call(data, (err, res) => {
			if(err) {
				setFormStatus(STATUS.ERROR)
				console.error(err)
			} else {
				setFormStatus(STATUS.SUCCESS)
				setIsModalOpen(false)
				navigate(`/admin/${res}`)
			}
		})
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
						title: '',
						question: '',
					} }
					onValidSubmit={ onSubmit }
				>
					<Grid container spacing={ 2 }>
						<Grid item xs={ 12 }>
							<TextInput name="title" label="Theme Title" required />
						</Grid>

						<Grid item xs={ 12 }>
							<TextInput name="question" label="Theme Question" />
						</Grid>

						<Grid item xs={ 12 }>
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

export default NewThemeModal

