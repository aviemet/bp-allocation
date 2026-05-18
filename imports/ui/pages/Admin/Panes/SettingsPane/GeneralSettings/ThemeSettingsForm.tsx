import {
	FormControl,
	FormControlLabel,
	FormLabel,
	Grid,
	InputAdornment,
	Paper,
} from "@mui/material"
import { useState } from "react"

import { ThemeMethods } from "/imports/api/methods"
import { useTheme } from "/imports/api/hooks"
import { ThemeSchema, DEFAULT_NUM_TOP_ORGS } from "/imports/api/db"
import { consoleLog } from "/imports/lib/logging"
import { formatters, roundFloat } from "/imports/lib/utils"

import { Form, Loading, NumberInput, STATUS, SubmitButton, Switch, TextInput, type Status } from "/imports/ui/components"

export const ThemeSettingsForm = () => {
	const { theme } = useTheme()

	const [formStatus, setFormStatus] = useState<Status>(STATUS.READY)

	const sanitizeData = (data: Record<string, unknown>) => {
		const sanitizedData = data
		const coerced = (value: unknown) => (value === "" || value === null || value === undefined ? 0 : value)
		sanitizedData.leverageTotal = roundFloat(String(coerced(sanitizedData.leverageTotal)))
		sanitizedData.consolationAmount = roundFloat(String(coerced(sanitizedData.consolationAmount)))
		sanitizedData.minLeverageAmount = roundFloat(String(coerced(sanitizedData.minLeverageAmount)))
		sanitizedData.minStartingFunds = roundFloat(String(coerced(sanitizedData.minStartingFunds)))
		sanitizedData.matchRatio = parseInt(String(coerced(sanitizedData.matchRatio)), 10)
		sanitizedData.inPersonMatchRatio = parseInt(String(coerced(sanitizedData.inPersonMatchRatio)), 10)
		sanitizedData.chitWeight = parseInt(String(coerced(sanitizedData.chitWeight)), 10)

		if(!sanitizedData.numTopOrgs && theme) {
			sanitizedData.numTopOrgs = theme.numTopOrgs || DEFAULT_NUM_TOP_ORGS
		}
		return sanitizedData
	}

	const onSubmit = async (data: Record<string, unknown>) => {
		if(!theme) {
			setFormStatus(STATUS.ERROR)
			return
		}

		const themeId = theme._id
		if(!themeId) {
			setFormStatus(STATUS.ERROR)
			return
		}

		setFormStatus(STATUS.SUBMITTING)
		try {
			await ThemeMethods.update.callAsync({
				id: themeId,
				data: data,
			})
			setFormStatus(STATUS.SUCCESS)
		} catch (err) {
			consoleLog.error(err)
			setFormStatus(STATUS.ERROR)
		}
	}

	const onError = (errors: unknown, data: unknown) => {
		consoleLog.error("Validation errors:", JSON.stringify(errors, null, 2))
		consoleLog.error("Data:", JSON.stringify(data, null, 2))
	}

	if(!theme) return <Loading />
	return (
		<Form
			onValidSubmit={ onSubmit }
			schema={ ThemeSchema }
			onSanitize={ sanitizeData }
			onValidationError={ onError }
			defaultValues={ {
				title: theme.title || "",
				question: theme.question || "",
				leverageTotal: theme.leverageTotal || "",
				chitWeight: theme.chitWeight || "",
				matchRatio: theme.matchRatio || "",
				inPersonMatchRatio: theme.inPersonMatchRatio || "",
				inPersonPledgeActive: theme.inPersonPledgeActive || false,
				consolationAmount: theme.consolationAmount || "",
				consolationActive: theme.consolationActive || false,
				minLeverageAmount: theme.minLeverageAmount || "",
				minLeverageAmountActive: theme.minLeverageAmountActive || false,
				minStartingFunds: theme.minStartingFunds || "",
				minStartingFundsActive: theme.minStartingFundsActive || false,
				allowRunnersUpPledges: theme.allowRunnersUpPledges || false,
				leverageRunnersUpPledges: theme.leverageRunnersUpPledges || false,
			} }
		>
			<Grid container spacing={ 2 }>
				<Grid size={ { xs: 12 } }>
					{ /* Title */ }
					<TextInput
						name="title"
						label="Theme Title"
					/>
				</Grid>

				<Grid size={ { xs: 12 } }>
					{ /* Question */ }
					<TextInput
						name="question"
						label="Theme Question"
					/>
				</Grid>

				<Grid size={ { xs: 12, md: 6 } }>
					{ /* Total Leverage Amount */ }
					<NumberInput
						name="leverageTotal"
						label="Total Pot"
						slotProps={ {
							input: {
								startAdornment: <InputAdornment position="start">$</InputAdornment>,
							},
						} }
					/>
				</Grid>

				<Grid size={ { xs: 12, md: 6 } }>
					<b>Total from member funds</b>
					<div>{ formatters.currency.format(Number(theme.memberFunds || 0)) }</div>
				</Grid>

				<Grid size={ { xs: 12, md: 6 } }>
					{ /* Chit Weight */ }
					<NumberInput
						name="chitWeight"
						integer
						label="Chit weight in ounces"
					/>
				</Grid>

				<Grid size={ { xs: 12, md: 6 } }>
					{ /* Match Ratio */ }
					<NumberInput
						name="matchRatio"
						integer
						label="Multiplier for matched funds"
					/>
				</Grid>

				<Grid size={ { xs: 12 } }>
					<Paper sx={ { p: 2 } }>
						<FormControl component="fieldset" variant="standard" fullWidth>
							<FormLabel component="legend">In-Person Pledges</FormLabel>
							<Grid container spacing={ 2 } sx={ { mt: 1 } }>
								<Grid size={ { xs: 12, md: 6 } }>
									{ /* In-Person Match Ratio */ }
									<NumberInput
										name="inPersonMatchRatio"
										integer
										label="Multiplier for in-person matched funds"
									/>
								</Grid>

								<Grid size={ { xs: 12, md: 6 } }>
									{ /* In-Person Pledge feature flag */ }
									<FormControlLabel
										label="Use different in-person match ratio"
										control={ <Switch name="inPersonPledgeActive" /> }
									/>
								</Grid>
							</Grid>
						</FormControl>
					</Paper>
				</Grid>

				<Grid size={ { xs: 12, md: 6 } }>
					{ /* Consolation Amount */ }
					<NumberInput
						name="consolationAmount"
						label="Amount for bottom orgs"
						slotProps={ {
							input: {
								startAdornment: <InputAdornment position="start">$</InputAdornment>,
							},
						} }
					/>
				</Grid>

				<Grid size={ { xs: 12, md: 6 } }>
					{ /* Consolation Active */ }
					<FormControlLabel
						label="Use Consolation?"
						control={ <Switch name="consolationActive" /> }
					/>
				</Grid>

				<Grid size={ { xs: 12, md: 6 } }>
					{ /* Minimum Leverage Amount */ }
					<NumberInput
						name="minLeverageAmount"
						label="Minimum Leverage Amount"
						slotProps={ {
							input: {
								startAdornment: <InputAdornment position="start">$</InputAdornment>,
							},
						} }
					/>
				</Grid>

				<Grid size={ { xs: 12, md: 6 } }>
					{ /* Minimum Leverage Amount Active */ }
					<FormControlLabel
						label="Use Minimum Leverage Amount"
						control={ <Switch name="minLeverageAmountActive" /> }
					/>
				</Grid>

				<Grid size={ { xs: 12, md: 6 } }>
					{ /* Minimum Starting Funds */ }
					<NumberInput
						name="minStartingFunds"
						label="Minimum Starting Funds"
						slotProps={ {
							input: {
								startAdornment: <InputAdornment position="start">$</InputAdornment>,
							},
						} }
					/>
				</Grid>

				<Grid size={ { xs: 12, md: 6 } }>
					{ /* Minimum Starting Funds Active */ }
					<FormControlLabel
						label="Pre-allocate Starting Funds"
						control={ <Switch name="minStartingFundsActive" /> }
					/>
				</Grid>

				<Grid size={ { xs: 12 } }>
					<Paper sx={ { p: 2 } }>
						<FormControl component="fieldset" variant="standard" fullWidth>
							<FormLabel component="legend">Runners Up Pledges</FormLabel>
							<Grid container spacing={ 2 } sx={ { mt: 1 } }>
								<Grid size={ { xs: 12, md: 6 } }>
									{ /* Allow Runners Up Pledges */ }
									<FormControlLabel
										label="Allow Pledging to Runners Up"
										control={ <Switch name="allowRunnersUpPledges" /> }
									/>
								</Grid>

								<Grid size={ { xs: 12, md: 6 } }>
									{ /* Leverage Runners Up Pledges */ }
									<FormControlLabel
										label="Match Runners Up Pledges"
										control={ <Switch name="leverageRunnersUpPledges" /> }
									/>
								</Grid>
							</Grid>
						</FormControl>
					</Paper>
				</Grid>

				<Grid size={ { xs: 12 } } sx={ { textAlign: "right" } }>
					<SubmitButton type="submit" status={ formStatus } setStatus={ setFormStatus }>Save Changes</SubmitButton>
				</Grid>
			</Grid>
		</Form>
	)
}

