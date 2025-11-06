import {
	Grid,
	Stack,
} from "@mui/material"
import { observer } from "mobx-react-lite"
import { useState } from "react"
import { PresentationSettingsMethods } from "/imports/api/methods"
import { PresentationSettingsSchema } from "/imports/api/db"
import { useSettings } from "/imports/api/providers"

import ResetOrgFundsButton from "/imports/ui/components/Buttons/ResetOrgFundsButton"
import ResetMessageStatusButton from "/imports/ui/components/Buttons/ResetMessageStatusButton"

import { Form, TextInput, SubmitButton, STATUS } from "/imports/ui/components/Form"
import { Loading } from "/imports/ui/components"

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
			data: data,
		}, (err, res) => {
			if(err) {
				setFormStatus(STATUS.ERROR)
			} else {
				setFormStatus(STATUS.SUCCESS)
			}
		})
	}

	if(settingsLoading) return (<Loading />)
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
					<Grid size={ { xs: 12 } }>
						<TextInput
							name="twilioRateLimit"
							label="Rate limit in ms for sending texts"
						/>
					</Grid>
					<Grid size={ { xs: 12 } } sx={ { textAlign: "right" } }>
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
