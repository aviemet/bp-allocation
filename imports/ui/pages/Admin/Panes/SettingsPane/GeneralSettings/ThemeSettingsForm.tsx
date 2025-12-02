import {
	FormControlLabel,
	Grid,
	InputAdornment,
} from "@mui/material"
import { useState } from "react"
import { ThemeMethods } from "/imports/api/methods"
import { useTheme } from "/imports/api/hooks"
import { ThemeSchema, DEFAULT_NUM_TOP_ORGS } from "/imports/api/db"
import { formatters, roundFloat } from "/imports/lib/utils"

import { Form, TextInput, Switch, SubmitButton, STATUS, type Status } from "/imports/ui/components/Form"
import { Loading } from "/imports/ui/components"

const SettingsPane = () => {
	const { theme } = useTheme()

	const [formStatus, setFormStatus] = useState<Status>(STATUS.READY)

	const sanitizeData = (data: Record<string, unknown>) => {
		const sanitizedData = data
		if(sanitizedData.leverageTotal) sanitizedData.leverageTotal = roundFloat(String(sanitizedData.leverageTotal))
		if(sanitizedData.consolationAmount) sanitizedData.consolationAmount = roundFloat(String(sanitizedData.consolationAmount))
		if(sanitizedData.minLeverageAmount) sanitizedData.minLeverageAmount = roundFloat(String(sanitizedData.minLeverageAmount))
		if(sanitizedData.matchRatio) sanitizedData.matchRatio = parseInt(String(sanitizedData.matchRatio))
		if(sanitizedData.chitWeight) sanitizedData.chitWeight = parseInt(String(sanitizedData.chitWeight))
		if(!sanitizedData.numTopOrgs && theme) {
			sanitizedData.numTopOrgs = theme.numTopOrgs || DEFAULT_NUM_TOP_ORGS
		}
		return sanitizedData
	}

	const onSubmit = async (data: Record<string, unknown>) => {
		if(!theme) return
		setFormStatus(STATUS.SUBMITTING)
		try {
			await ThemeMethods.update.callAsync({
				id: theme._id,
				data: data,
			})
			setFormStatus(STATUS.SUCCESS)
		} catch (err) {
			console.error(err)
			setFormStatus(STATUS.READY)
		}
	}

	const onError = (errors: unknown, data: unknown) => {
		console.error("Validation errors:", JSON.stringify(errors, null, 2))
		console.error("Data:", JSON.stringify(data, null, 2))
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
				consolationAmount: theme.consolationAmount || "",
				consolationActive: theme.consolationActive || false,
				minLeverageAmount: theme.minLeverageAmount || "",
				minLeverageAmountActive: theme.minLeverageAmountActive || false,
				allowRunnersUpPledges: theme.allowRunnersUpPledges || false,
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
					<TextInput
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
					<TextInput
						name="chitWeight"
						type="number"
						label="Chit weight in ounces"
					/>
				</Grid>

				<Grid size={ { xs: 12, md: 6 } }>
					{ /* Match Ratio */ }
					<TextInput
						name="matchRatio"
						type="number"
						label="Multiplier for matched funds"
					/>
				</Grid>

				<Grid size={ { xs: 12, md: 6 } }>
					{ /* Consolation Amount */ }
					<TextInput
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
					<TextInput
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
					{ /* Allow Runners Up Pledges */ }
					<FormControlLabel
						label="Allow Pledging to Runners Up"
						control={ <Switch name="allowRunnersUpPledges" /> }
					/>
				</Grid>

				<Grid size={ { xs: 12 } } sx={ { textAlign: "right" } }>
					<SubmitButton type="submit" status={ formStatus } setStatus={ setFormStatus }>Save Changes</SubmitButton>
				</Grid>
			</Grid>
		</Form>
	)
}

export default SettingsPane
