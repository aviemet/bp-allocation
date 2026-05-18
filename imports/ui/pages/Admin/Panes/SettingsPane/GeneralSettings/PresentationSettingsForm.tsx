import {
	Grid,
	Paper,
	Stack,
} from "@mui/material"
import { useState } from "react"

import { PresentationSettingsMethods } from "/imports/api/methods"
import { useSettings, useTheme } from "/imports/api/hooks"
import { PresentationSettingsSchema } from "/imports/api/db"
import { consoleLog } from "/imports/lib/logging"
import { roundFloat } from "/imports/lib/utils"
import {
	Form,
	InPersonPledgeQrCode,
	Loading,
	NumberInput,
	STATUS,
	SubmitButton,
	Switch,
	type Status,
} from "/imports/ui/components"

export const PresentationSettingsForm = () => {
	const { settings, settingsLoading } = useSettings()
	const { theme } = useTheme()

	const [formStatus, setFormStatus] = useState<Status>(STATUS.READY)

	const showInPersonQr = !!theme?.inPersonPledgeActive

	const sanitizeData = (data: Record<string, unknown>) => {
		const sanitizedData = data
		const coerced = (value: unknown) => (value === "" || value === null || value === undefined ? 0 : value)
		sanitizedData.awardAmount = roundFloat(String(coerced(sanitizedData.awardAmount)))
		return sanitizedData
	}

	const onSubmit = async (data: Record<string, unknown>) => {
		if(!settings) return
		setFormStatus(STATUS.SUBMITTING)
		try {
			await PresentationSettingsMethods.update.callAsync({
				id: settings._id,
				data: data,
			})
			setFormStatus(STATUS.SUCCESS)
		} catch (_err) {
			setFormStatus(STATUS.READY)
		}
	}

	const onError = (errors: unknown, data: unknown) => {
		consoleLog.error({ errors, data })
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
						<Stack direction="row" sx={ { justifyContent: "space-between", alignItems: "center" } }>
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
						<Stack direction="row" sx={ { justifyContent: "space-between", alignItems: "center" } }>
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
						<Stack direction="row" sx={ { justifyContent: "space-between", alignItems: "center" } }>
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
					{ settings.awardsPresentation && <NumberInput
						name="awardAmount"
						label="Amount being awarded"
					/> }
				</Grid>

				{ /* OrgCard Show Ask */ }
				<Grid size={ { xs: 12 } }>
					<Paper sx={ { p: 1 } }>
						<Stack direction="row" sx={ { justifyContent: "space-between", alignItems: "center" } }>
							<div>
								<label>Show &quot;Ask&quot; on Org Cards</label>
							</div>
							<div>
								<Switch name="showAskOnOrgCards" />
							</div>
						</Stack>
					</Paper>
				</Grid>

				{ showInPersonQr && (
					<Grid size={ { xs: 12 } }>
						<Paper sx={ { p: 2 } }>
							<InPersonPledgeQrCode />
						</Paper>
					</Grid>
				) }

				<Grid size={ { xs: 12 } } sx={ { textAlign: "right" } }>
					<SubmitButton type="submit" status={ formStatus } setStatus={ setFormStatus }>Save Changes</SubmitButton>
				</Grid>

			</Grid>
		</Form>
	)
}

