import React, { useState, useEffect } from 'react'
import { PresentationSettingsMethods } from '/imports/api/methods'
import { observer } from 'mobx-react-lite'
import { useSettings } from '/imports/api/providers'
import { PresentationSettingsSchema } from '/imports/api/db/schema'

import {
	Button,
	CircularProgress,
	Grid,
	Paper,
	Stack,
} from '@mui/material'
import { Form, TextInput, Switch, SubmitButton, STATUS, } from '/imports/ui/Components/Form'

const PresentationSettingsForm = observer(() => {
	const { settings, isLoading: settingsLoading } = useSettings()

	const [formStatus, setFormStatus] = useState(STATUS.READY)

	const sanitizeData = data => {
		const sanitizedData = data
		return sanitizedData
	}

	const onSubmit = data => {
		setFormStatus(STATUS.SUBMITTING)
		PresentationSettingsMethods.update.call({
			id: settings._id,
			data: data
		}, (err, res) => {
			if(err) {
				setFormStatus(STATUS.READY)
			} else {
				setFormStatus(STATUS.SUCCESS)
			}
		})
	}

	const onError = (errors, data) => {
		console.log({ errors, data })
	}

	if(!settings || settingsLoading) return <CircularProgress />
	return (
		<Form
			onValidSubmit={ onSubmit }
			schema={ PresentationSettingsSchema }
			onSanitize={ sanitizeData }
			onValidationError={ onError }
			defaultValues={ {
				awardAmount: settings.awardAmount || 0,
				useKioskChitVoting: settings.useKioskChitVoting || false,
				useKioskFundsVoting: settings.useKioskFundsVoting || false,
				awardsPresentation: settings.awardsPresentation || false,
			} }
		>
			<Grid container spacing={ 2 }>
				{/* Use Chit Votes Kiosk Toggle */}
				<Grid item xs={ 12 }>
					<Paper sx={ { p: 1 } }>
						<Stack direction="row" justifyContent="space-between" alignItems="center">
							<div>
								<label>Chit Votes Entered Via:</label>
							</div>
							<div>
								<label>Manual</label>
								<Switch
									name='useKioskChitVoting'
								/>
								<label>Kiosk</label>
							</div>
						</Stack>
					</Paper>
				</Grid>

				{/* Use Kiosk Votes Kiosk Toggle */}
				<Grid item xs={ 12 }>
					<Paper sx={ { p: 1 } }>
						<Stack direction="row" justifyContent="space-between" alignItems="center">
							<div>
								<label>Funds Voting Entered Via:</label>
							</div>
							<div>
								<label>Manual</label>
								<Switch
									name='useKioskFundsVoting'
								/>
								<label>Kiosk</label>
							</div>
						</Stack>
					</Paper>
				</Grid>

				{/* Presentation Type */}
				<Grid item xs={ 12 }>
					<Paper sx={ { p: 1 } }>
						<Stack direction="row" justifyContent="space-between" alignItems="center">
							<div>
								<label>Change Presentation Type to Awards Style</label>
							</div>
							<div>
								<label>Full Presentation</label>
								<Switch
									name='awardsPresentation'
								/>
								<label>Awards</label>
							</div>
						</Stack>
					</Paper>
				</Grid>

				<Grid item xs={ 12 } md={ 6 }>
					{ settings.awardsPresentation && <TextInput
						name='awardAmount'
						type='number'
						label='Amount being awarded'
					/> }
				</Grid>

				<Grid item xs={ 12 } align="right">
					<SubmitButton status={ formStatus } setStatus={ setFormStatus }>Save Changes</SubmitButton>
				</Grid>

			</Grid>
		</Form>
	)
})

export default PresentationSettingsForm
