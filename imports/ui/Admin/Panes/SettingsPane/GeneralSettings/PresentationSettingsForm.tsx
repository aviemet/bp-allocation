import React, { useState } from 'react'
import { PresentationSettingsMethods } from '/imports/api/methods'
import { observer } from 'mobx-react-lite'
import { useSettings } from '/imports/api/providers'
import { PresentationSettingsSchema } from '/imports/api/db/schema'

import {
	Grid,
	Paper,
	Stack,
} from '@mui/material'
import { Form, TextInput, Switch, SubmitButton, STATUS } from '/imports/ui/Components/Form'
import { Loading } from '/imports/ui/Components'
import { type FieldErrors } from 'react-hook-form'

const PresentationSettingsForm = observer(() => {
	const { settings, isLoading: settingsLoading } = useSettings()

	const [formStatus, setFormStatus] = useState<Values<typeof STATUS>>(STATUS.READY)

	const sanitizeData = (data: { [x: string]: any }) => {
		const sanitizedData = data
		return sanitizedData
	}

	const onSubmit = (data: { [x: string]: any }) => {
		setFormStatus(STATUS.SUBMITTING)
		PresentationSettingsMethods.update.call({
			id: settings._id,
			data,
		}, (err, res) => {
			if(err) {
				setFormStatus(STATUS.READY)
			} else {
				setFormStatus(STATUS.SUCCESS)
			}
		})
	}

	const onError = (errors: FieldErrors<any>, data: any) => {
		console.error({ errors, data })
	}

	if(!settings || settingsLoading) return <Loading />
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
				showAskOnOrgCards: settings.showAskOnOrgCards || false,
			} }
		>
			<Grid container spacing={ 2 }>
				{ /* Use Chit Votes Kiosk Toggle */ }
				<Grid item xs={ 12 }>
					<Paper sx={ { p: 1 } }>
						<Stack direction="row" justifyContent="space-between" alignItems="center">
							<div>
								<label>Chit Votes Entered Via:</label>
							</div>
							<div>
								<label>Manual</label>
								<Switch name='useKioskChitVoting' />
								<label>Kiosk</label>
							</div>
						</Stack>
					</Paper>
				</Grid>

				{ /* Use Kiosk Votes Kiosk Toggle */ }
				<Grid item xs={ 12 }>
					<Paper sx={ { p: 1 } }>
						<Stack direction="row" justifyContent="space-between" alignItems="center">
							<div>
								<label>Funds Voting Entered Via:</label>
							</div>
							<div>
								<label>Manual</label>
								<Switch name='useKioskFundsVoting' />
								<label>Kiosk</label>
							</div>
						</Stack>
					</Paper>
				</Grid>

				{ /* Presentation Type */ }
				<Grid item xs={ 12 }>
					<Paper sx={ { p: 1 } }>
						<Stack direction="row" justifyContent="space-between" alignItems="center">
							<div>
								<label>Change Presentation Type to Awards Style</label>
							</div>
							<div>
								<label>Full Presentation</label>
								<Switch name='awardsPresentation' />
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

				{ /* OrgCard Show Ask */ }
				<Grid item xs={ 12 }>
					<Paper sx={ { p: 1 } }>
						<Stack direction="row" justifyContent="space-between" alignItems="center">
							<div>
								<label>Show &quot;Ask&quot; on Org Cards</label>
							</div>
							<div>
								<Switch name='showAskOnOrgCards' />
							</div>
						</Stack>
					</Paper>
				</Grid>

				<Grid item xs={ 12 } align="right">
					<SubmitButton type="submit" status={ formStatus } setStatus={ setFormStatus }>Save Changes</SubmitButton>
				</Grid>

			</Grid>
		</Form>
	)
})

export default PresentationSettingsForm
