import {
	Grid,
	Paper,
	Stack,
} from "@mui/material"
import { observer } from "mobx-react-lite"
import { useState } from "react"
import { PresentationSettingsMethods } from "/imports/api/methods"
import { useSettings } from "/imports/api/providers"
import { PresentationSettingsSchema } from "/imports/api/db"

import { Form, TextInput, Switch, SubmitButton, STATUS } from "/imports/ui/components/Form"
import { Loading } from "/imports/ui/components"

const PresentationSettingsForm = observer(() => {
	const { settings, isLoading: settingsLoading } = useSettings()

	const [formStatus, setFormStatus] = useState(STATUS.READY)

	const sanitizeData = data => {
		const sanitizedData = data
		return sanitizedData
	}

	const onSubmit = async data => {
		setFormStatus(STATUS.SUBMITTING)
		try {
			await PresentationSettingsMethods.update.callAsync({
				id: settings._id,
				data: data,
			})
			setFormStatus(STATUS.SUCCESS)
		} catch (err) {
			setFormStatus(STATUS.READY)
		}
	}

	const onError = (errors, data) => {
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
				<Grid size={ { xs: 12 } }>
					<Paper sx={ { p: 1 } }>
						<Stack direction="row" justifyContent="space-between" alignItems="center">
							<div>
								<label>Chit Votes Entered Via:</label>
							</div>
							<div>
								<label>Manual</label>
								<Switch name="useKioskChitVoting" />
								<label>Kiosk</label>
							</div>
						</Stack>
					</Paper>
				</Grid>

				{ /* Use Kiosk Votes Kiosk Toggle */ }
				<Grid size={ { xs: 12 } }>
					<Paper sx={ { p: 1 } }>
						<Stack direction="row" justifyContent="space-between" alignItems="center">
							<div>
								<label>Funds Voting Entered Via:</label>
							</div>
							<div>
								<label>Manual</label>
								<Switch name="useKioskFundsVoting" />
								<label>Kiosk</label>
							</div>
						</Stack>
					</Paper>
				</Grid>

				{ /* Presentation Type */ }
				<Grid size={ { xs: 12 } }>
					<Paper sx={ { p: 1 } }>
						<Stack direction="row" justifyContent="space-between" alignItems="center">
							<div>
								<label>Change Presentation Type to Awards Style</label>
							</div>
							<div>
								<label>Full Presentation</label>
								<Switch name="awardsPresentation" />
								<label>Awards</label>
							</div>
						</Stack>
					</Paper>
				</Grid>

				<Grid size={ { xs: 12, md: 6 } }>
					{ settings.awardsPresentation && <TextInput
						name="awardAmount"
						type="number"
						label="Amount being awarded"
					/> }
				</Grid>

				{ /* OrgCard Show Ask */ }
				<Grid size={ { xs: 12 } }>
					<Paper sx={ { p: 1 } }>
						<Stack direction="row" justifyContent="space-between" alignItems="center">
							<div>
								<label>Show &quot;Ask&quot; on Org Cards</label>
							</div>
							<div>
								<Switch name="showAskOnOrgCards" />
							</div>
						</Stack>
					</Paper>
				</Grid>

				<Grid size={ { xs: 12 } } sx={ { textAlign: "right" } }>
					<SubmitButton type="submit" status={ formStatus } setStatus={ setFormStatus }>Save Changes</SubmitButton>
				</Grid>

			</Grid>
		</Form>
	)
})

export default PresentationSettingsForm
