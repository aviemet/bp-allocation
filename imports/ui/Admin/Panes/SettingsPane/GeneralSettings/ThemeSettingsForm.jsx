import React, { useState, useEffect } from 'react'
import { ThemeMethods } from '/imports/api/methods'
import { observer } from 'mobx-react-lite'
import { useTheme } from '/imports/api/providers'
import { ThemeSchema } from '/imports/api/db/schema'
import { formatters, roundFloat } from '/imports/lib/utils'

import {
	CircularProgress,
	FormControlLabel,
	Grid,
	InputAdornment,
} from '@mui/material'
import { Form, TextInput, Switch, SubmitButton, STATUS, } from '/imports/ui/Components/Form'

const SettingsPane = observer(() => {
	const { theme } = useTheme()

	const [formStatus, setFormStatus] = useState(STATUS.READY)

	const sanitizeData = data => {
		const sanitizedData = data
		if(sanitizedData.leverageTotal) sanitizedData.leverageTotal = roundFloat(sanitizedData.leverageTotal)
		if(sanitizedData.consolationAmount) sanitizedData.consolationAmount = roundFloat(sanitizedData.consolationAmount)
		if(sanitizedData.matchRatio) sanitizedData.matchRatio = parseInt(sanitizedData.matchRatio)
		if(sanitizedData.chitWeight) sanitizedData.chitWeight = parseInt(sanitizedData.chitWeight)
		return sanitizedData
	}

	const onSubmit = data => {
		setFormStatus(STATUS.SUBMITTING)
		ThemeMethods.update.call({
			id: theme._id,
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

	if(!theme) return <CircularProgress />
	return (
		<Form
			onValidSubmit={ onSubmit }
			schema={ ThemeSchema }
			onSanitize={ sanitizeData }
			onValidationError={ onError }
			defaultValues={ {
				title: theme.title || '',
				question: theme.question || '',
				leverageTotal: theme.leverageTotal || '',
				chitWeight: theme.chitWeight || '',
				matchRatio: theme.matchRatio || '',
				consolationAmount: theme.consolationAmount || '',
				consolationActive: theme.consolationActive || false,
			} }
		>
			<Grid container spacing={ 2 }>
				<Grid item xs={ 12 }>
					{/* Title */}
					<TextInput
						name="title"
						label="Theme Title"
					/>
				</Grid>

				<Grid item xs={ 12 }>
					{/* Question */}
					<TextInput
						name="question"
						label="Theme Question"
					/>
				</Grid>

				<Grid item xs={ 12 } md={ 6 }>
					{/* Total Leverage Amount */}
					<TextInput
						name="leverageTotal"
						label="Total Pot"
						inputProps={ {
							startAdornment: <InputAdornment position="start">$</InputAdornment>,
						} }
					/>
				</Grid>

				<Grid item xs={ 12 } md={ 6 }>
					<b>Total from member funds</b>
					<div>{ formatters.currency.format(theme.memberFunds) }</div>
				</Grid>

				<Grid item xs={ 12 } md={ 6 }>
					{/* Chit Weight */}
					<TextInput
						name="chitWeight"
						type="number"
						label="Chit weight in ounces"
					/>
				</Grid>

				<Grid item xs={ 12 } md={ 6 }>
					{/* Match Ratio */}
					<TextInput
						name="matchRatio"
						type="number"
						label="Multiplier for matched funds"
					/>
				</Grid>

				<Grid item xs={ 12 } md={ 6 }>
					{/* Consolation Amount */}
					<TextInput
						name="consolationAmount"
						label="Amount for bottom orgs"
						inputProps={ {
							startAdornment: <InputAdornment position="start">$</InputAdornment>,
						} }
					/>
				</Grid>

				<Grid item xs={ 12 } md={ 6 }>
					{/* Consolation Active */}
					<FormControlLabel
						label="Use Consolation?"
						control={ <Switch name="consolationActive" /> }
					/>
				</Grid>

				<Grid item xs={ 12 } align="right">
					<SubmitButton type="submit" status={ formStatus } setStatus={ setFormStatus }>Save Changes</SubmitButton>
				</Grid>
			</Grid>
		</Form>
	)
})

export default SettingsPane
