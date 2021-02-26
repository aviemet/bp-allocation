import React, { useState, useEffect } from 'react'
import _ from 'lodash'
import { ThemeMethods, PresentationSettingsMethods } from '/imports/api/methods'
import { observer } from 'mobx-react-lite'
import { useTheme, useSettings } from '/imports/api/providers'

import CustomMessage from '/imports/ui/Components/CustomMessage'
import { Loader, Form } from 'semantic-ui-react'
import ResetOrgFundsButton from '/imports/ui/Components/Buttons/ResetOrgFundsButton'

const SettingsPane = observer(props => {
	const { theme } = useTheme()
	const { settings, isLoading: settingsLoading } = useSettings()

	const [ timerLength, setTimerLength ]               = useState(settings.timerLength || 60)
	const [ useKioskChitVoting, setKioskChitVoting ]    = useState(settings.useKioskChitVoting || false)
	const [ useKioskFundsVoting, setKioskFundsVoting ]  = useState(settings.useKioskFundsVoting || false)
	const [ awardsPresentation, setAwardsPresentation ] = useState(settings.awardsPresentation || false)
	const [ awardAmount, setAwardAmount ]               = useState(settings.awardAmount || 0)
	const [ twilioRateLimit, setTwilioRateLimit ]       = useState(settings.twilioRateLimit || 100)

	const [ formErrorVisible, setFormErrorVisible ] = useState(false)
	const [ formErrorMessage, setFormErrorMessage ] = useState('')

	useEffect(() => {
		if(!settingsLoading) {
			setTimerLength(settings.timerLength)
			setKioskChitVoting(settings.useKioskChitVoting)
			setKioskFundsVoting(settings.useKioskFundsVoting)
			setAwardsPresentation(settings.awardsPresentation)
			setAwardAmount(settings.awardAmount)
			setTwilioRateLimit(settings.twilioRateLimit)
		}
	}, [settingsLoading])

	const showFormErrorMessage = () => {
		setFormErrorVisible(true)
		setTimeout(hideFormErrorMessage, 10000)
	}

	const hideFormErrorMessage = () => {
		setFormErrorVisible(false)
		setFormErrorMessage('')
	}

	const handleSubmit = e => {
		e.preventDefault()

		let formData = {
			settings: { timerLength, useKioskChitVoting, useKioskFundsVoting, awardsPresentation, awardAmount, twilioRateLimit }
		}

		// Iterate over database objects with keys to be saved
		_.forEach(formData, (value, dataKey) => {
			// In each object, delete keys which haven't changed
			_.keys(formData[dataKey]).map(key => {
				// I know we shouldn't use eval Justification:
				// Values being eval'd are not from user, the only way to have dynamic variable names in JS
				if(eval(key) === eval(dataKey)[key]) {
					delete formData[dataKey][key]
				}
			})
		})

		// Only update if data has changed
		if(!_.isEmpty(formData.theme)) {
			ThemeMethods.update.call({
				id: theme._id,
				data: formData.theme
			}, (err, res) => {
				if(err) {
					setFormErrorMessage(err.reason.errmsg)
					showFormErrorMessage()
					Object.keys(formData.theme).forEach(key => {
						const val = key.charAt(0).toUpperCase() + key.slice(1)
						eval(`set${val}('${theme[key]}')`)
					})
				}
			})
		}

		if(!_.isEmpty(formData.settings)) {
			PresentationSettingsMethods.update.call({
				id: settings._id,
				data: formData.settings
			})
		}
	}

	if(!theme) return(<Loader/>)
	return (
		<>
			<Form onBlur={ handleSubmit } onSubmit={ handleSubmit }>

				<Form.Group>
					{/* Twilio Rate Limit ms */}
					<Form.Field>
						<Form.Input
							name='settings.twilioRateLimit'
							type='text'
							placeholder='1000 is 1 second'
							label='Rate limit in ms for sending texts'
							value={ twilioRateLimit || '' }
							onChange={ e => setTwilioRateLimit(e.target.value) }
						/>
					</Form.Field>
				</Form.Group>
			</Form>

			<hr />

			<ResetOrgFundsButton />

			{ formErrorVisible && <CustomMessage
				negative
				onDismiss={ hideFormErrorMessage }
				heading='There was an error saving values'
				body={ formErrorMessage }
			/> }
		</>
	)
})

export default SettingsPane
