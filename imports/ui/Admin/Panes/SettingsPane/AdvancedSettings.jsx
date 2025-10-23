import React, { useState } from 'react'
import { PresentationSettingsMethods } from '/imports/api/methods'
import { PresentationSettingsSchema } from '/imports/api/db/schema'
import { observer } from 'mobx-react-lite'
import { useSettings } from '/imports/api/providers'

import ResetOrgFundsButton from '/imports/ui/Components/Buttons/ResetOrgFundsButton'
import ResetMessageStatusButton from '/imports/ui/Components/Buttons/ResetMessageStatusButton'

import {
	Grid,
	Stack,
} from '@mui/material'
import { Form, TextInput, SubmitButton, STATUS, } from '/imports/ui/Components/Form'
import { Loading } from '/imports/ui/Components'

const SettingsPane = observer(() => {
	const { settings, isLoading: settingsLoading } = useSettings()

	const [formStatus, setFormStatus] = useState(STATUS.READY)

	const defaultData = {
		twilioRateLimit: settings?.twilioRateLimit || 100,
	}

	const sanitizeData = data => {
		const sanitizedData = data
		sanitizedData.twilioRateLimit = parseInt(sanitizedData.twilioRateLimit)
		return data
	}

	const onError = (errors, data) => {
		console.log({ errors, data })
	}

	const onSubmit = data => {
		// console.log({ data })
		setFormStatus(STATUS.SUBMITTING)
		PresentationSettingsMethods.update.call({
			id: settings._id,
			data: data
		}, (err, res) => {
			if(err) {
				setFormStatus(STATUS.ERROR)
			} else {
				setFormStatus(STATUS.SUCCESS)
			}
		})
	}

	if(settingsLoading) return(<Loading />)
	return (
		<>
			<Form
				onValidSubmit={ onSubmit }
				schema={ PresentationSettingsSchema }
				onSanitize={ sanitizeData }
				onValidationError={ onError }
				defaultValues={ defaultData }
			>
				<Grid container spacing={ 2 }>
					<Grid item xs={ 12 }>
						<TextInput
							name='twilioRateLimit'
							label='Rate limit in ms for sending texts'
						/>
					</Grid>
					<Grid item xs={ 12 } align="right">
						<SubmitButton type="submit" status={ formStatus } setStatus={ setFormStatus }>Save Changes</SubmitButton>
					</Grid>
				</Grid>
			</Form>

			<hr />

			<Stack direction="row" justifyContent="space-between" alignItems="center">
				<ResetOrgFundsButton />
				<ResetMessageStatusButton />
			</Stack>
		</>
	)
})

export default SettingsPane
