import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import { ThemeMethods, PresentationSettingsMethods } from '/imports/api/methods';
import { observer } from 'mobx-react-lite';
import { useTheme, useSettings } from '/imports/api/providers';

import CustomMessage from '/imports/ui/Components/CustomMessage';
import { Loader, Form, Checkbox, Label } from 'semantic-ui-react';
import TextMembersButton from '/imports/ui/Components/TextMembersButton';
import ResetOrgFundsButton from '/imports/ui/Components/ResetOrgFundsButton';

const SettingsPane = observer(props => {
	const { theme } = useTheme();
	const { settings, isLoading: settingsLoading } = useSettings();

	const [ title, setTitle ]                           = useState(theme.title);
	const [ question, setQuestion ]                     = useState(theme.question);
	const [ slug, setSlug ]                             = useState(theme.slug);
	const [ chitWeight, setChitWeight ]                 = useState(theme.chitWeight);
	const [ matchRatio, setMatchRatio ]                 = useState(theme.matchRatio);
	const [ leverageTotal, setLeverageTotal ]           = useState(theme.leverageTotal);
	const [ consolationAmount, setConsolationAmount ]   = useState(theme.consolationAmount);
	const [ consolationActive, setConsolationActive ]   = useState(theme.consolationActive);
	const [ timerLength, setTimerLength ]               = useState(settings.timerLength || 60);
	const [ useKioskChitVoting, setKioskChitVoting ]    = useState(settings.useKioskChitVoting || false);
	const [ useKioskFundsVoting, setKioskFundsVoting ]  = useState(settings.useKioskFundsVoting || false);
	const [ awardsPresentation, setAwardsPresentation ] = useState(settings.awardsPresentation || false);
	const [ awardAmount, setAwardAmount ]               = useState(settings.awardAmount || 0);
	
	const [ formErrorVisible, setFormErrorVisible ] = useState(false);
	const [ formErrorMessage, setFormErrorMessage ] = useState('');

	useEffect(() => {
		if(!settingsLoading) {
			setTimerLength(settings.timerLength);
			setKioskChitVoting(settings.useKioskChitVoting);
			setKioskFundsVoting(settings.useKioskFundsVoting);
			setAwardsPresentation(settings.awardsPresentation);
			setAwardAmount(settings.awardAmount);
		}
	}, [settingsLoading]);

	const showFormErrorMessage = () => {
		setFormErrorVisible(true);
		setTimeout(hideFormErrorMessage, 10000);
	};

	const hideFormErrorMessage = () => {
		setFormErrorVisible(false);
		setFormErrorMessage('');
	};

	const handleSubmit = e => {
		e.preventDefault();

		let formData = {
			theme: { title, question, slug, chitWeight, matchRatio, leverageTotal, consolationActive, consolationAmount },
			settings: { timerLength, useKioskChitVoting, useKioskFundsVoting, awardsPresentation, awardAmount }
		};

		// Iterate over database objects with keys to be saved
		_.forEach(formData, (value, dataKey) => {
			// In each object, delete keys which haven't changed
			_.keys(formData[dataKey]).map(key => {
				// I know we shouldn't use eval; Justification:
				// Values being eval'd are not from user, the only way to have dynamic variable names in JS
				if(eval(key) === eval(dataKey)[key]) {
					delete formData[dataKey][key];
				}
			});
		});

		// Only update if data has changed
		if(!_.isEmpty(formData.theme)) {
			ThemeMethods.update.call({
				id: theme._id,
				data: formData.theme
			}, (err, res) => {
				if(err) {
					setFormErrorMessage(err.reason.errmsg);
					showFormErrorMessage();
					Object.keys(formData.theme).forEach(key => {
						const val = key.charAt(0).toUpperCase() + key.slice(1);
						eval(`set${val}('${theme[key]}')`);
					});
				}
			});
		}

		if(!_.isEmpty(formData.settings)) {
			PresentationSettingsMethods.update.call({
				id: settings._id,
				data: formData.settings
			});
		}
	};

	if(!theme) return(<Loader/>);
	return (
		<>
			<Form onBlur={ handleSubmit } onSubmit={ handleSubmit }>

				<Form.Group>

					{/* Title */}
					<Form.Field>
						<Form.Input 
							name='theme.title' 
							type='text' 
							placeholder='Title' 
							label='Theme Title' 
							value={ title || '' } 
							onChange={ e => setTitle(e.target.value) }  
						/>
					</Form.Field>

					{/* Question */}
					<Form.Field>
						<Form.Input 
							name='theme.question' 
							type='text' 
							placeholder='Question' 
							label='Theme Question' 
							value={ question || '' } 
							onChange={ e => setQuestion(e.target.value) } 
						/>
					</Form.Field>

					{/* Slug */}
					<Form.Field>
						<Form.Input 
							name='theme.slug' 
							type='text' 
							placeholder='Slug' 
							label='Theme Slug' 
							value={ slug || '' } 
							onChange={ e => setSlug(e.target.value) } 
						/>
					</Form.Field>

				</Form.Group>

				{/* Total Leverage Amount */}
				<Form.Group>
					<Form.Input 
						name='theme.leverageTotal' 
						icon='dollar sign' 
						iconPosition='left' 
						label='Total Pot' 
						placeholder='Total Pot' 
						value={ leverageTotal || 0 } 
						onChange={ e => setLeverageTotal(e.target.value) } 
					/>
				</Form.Group>

				<Form.Group>
					{/* Timer Length */}
					<Form.Input 
						name='presentationSettings.timerLength' 
						type='number' 
						placeholder='Timer Length' 
						label='Length of Timers' 
						value={ timerLength || 0 } 
						onChange={ e => setTimerLength(e.target.value) } 
					/>

					{/* Chit Weight */}
					<Form.Input 
						name='theme.chitWeight' 
						type='number' 
						placeholder='Chit Weight' 
						label='Chit weight in ounces' 
						value={ chitWeight || 0 } 
						onChange={ e => setChitWeight(e.target.value) } 
					/>

					{/* Match Ratio */}
					<Form.Input 
						name='theme.matchRatio' 
						type='number' 
						placeholder='Match Ratio' 
						label='Multiplier for matched funds' 
						value={ matchRatio || 0 } 
						onChange={ e => setMatchRatio(e.target.value) } 
					/>

				</Form.Group>

				<Form.Group>
					{/* Use Chit Votes Kiosk Toggle */}
					<Form.Field>
						<label>Chit Votes Entered Via:</label>
						<Label>Manual</Label>
						<Checkbox 
							slider 
							name='settings.useKioskChitVoting' 
							style={ { 'verticalAlign': 'middle' } } 
							checked={ !!useKioskChitVoting } 
							onChange={ (e, value) => setKioskChitVoting(value.checked) } 
						/>
						<Label>Kiosk</Label>
					</Form.Field>

					{/* Use Kiosk Votes Kiosk Toggle */}
					<Form.Field>
						<label>Funds Voting Entered Via:</label>
						<Label>Manual</Label>
						<Checkbox 
							slider 
							name='settings.useKioskFundsVoting' 
							style={ { 'verticalAlign': 'middle' } } 
							checked={ !!useKioskFundsVoting } 
							onChange={ (e, value) => setKioskFundsVoting(value.checked) } 
						/>
						<Label>Kiosk</Label>
					</Form.Field>
				</Form.Group>

				<Form.Group>
					{/* Consolation Amount */}
					<Form.Input 
						name='theme.consolationAmount' 
						type='number' 
						placeholder='Consolation' 
						label='Amount for bottom orgs' 
						value={ consolationAmount || 0 } 
						onChange={ e => setConsolationAmount(e.target.value) } 
					/>

					{/* Consolation Active */}
					<Form.Checkbox 
						toggle 
						name='theme.consolationActive' 
						label='Use Consolation?' 
						checked={ !!consolationActive } 
						onChange={ (e, value) => setConsolationActive(value.checked) } 
					/>
				</Form.Group>

				<Form.Group>
					{/* Presentation Type */}
					<Form.Field>
						<label>Change Presentation Type to Awards Style</label>
						<Label>Full Presentation</Label>
						<Checkbox
							slider 
							name='settings.presentationType'
							checked={ !!awardsPresentation }
							onChange={ (e, value) => setAwardsPresentation(value.checked) }
						/>
						<Label>Awards</Label>
					</Form.Field>

					{ awardsPresentation && <Form.Input 
						name='settings.awardAmount' 
						type='number' 
						placeholder='Award Amount' 
						label='Amount being awarded' 
						value={ awardAmount || 0 } 
						onChange={ e => setAwardAmount(e.target.value) } 
					/> }

				</Form.Group>
			</Form>

			<TextMembersButton
				message="From Battery Powered: Excuse us! We sent a bad link. The finalists can be seen here http://bit.ly/2TECprF Voting starts later tonight!"
				title='Voting to Start Later'
				link={ false }
			/>

			<hr />
			
			<ResetOrgFundsButton />

			{ formErrorVisible && <CustomMessage 
				negative 
				onDismiss={ hideFormErrorMessage }
				heading='There was an error saving values'
				body={ formErrorMessage }
			/> }
		</>
	);
});

export default SettingsPane;

/*
Voting for Allocation Night can be done online! You'll receive a link tonight. For now, here are the finalists
*/