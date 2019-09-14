import React, { useState } from 'react';

import { useTheme, useSettings } from '/imports/stores/AppContext';

import _ from 'lodash';

import { ThemeMethods, PresentationSettingsMethods } from '/imports/api/methods';

import { Loader, Form, Checkbox, Label } from 'semantic-ui-react';

import { observer } from 'mobx-react-lite';
import { toJS } from 'mobx';
import { useData } from '/imports/stores/DataProvider';

const SettingsPane = observer(props => {

	const data = useData();
	const theme = data.theme || {};

	console.log({ theme: theme });

	// const theme = useTheme();
	// const settings = useSettings();
	const settings = {};

	const [ title, setTitle ]                          = useState(theme.title);
	const [ question, setQuestion ]                    = useState(theme.question);
	const [ chitWeight, setChitWeight ]                = useState(theme.chitWeight);
	const [ matchRatio, setMatchRatio ]                = useState(theme.matchRatio);
	const [ leverageTotal, setLeverageTotal ]          = useState(theme.leverageTotal);
	const [ consolationAmount, setConsolationAmount ]  = useState(theme.consolationAmount);
	const [ consolationActive, setConsolationActive ]  = useState(theme.consolationActive);
	const [ timerLength, setTimerLength ]              = useState(settings.timerLength);
	const [ useKioskChitVoting, setKioskChitVoting ]   = useState(settings.useKioskChitVoting);
	const [ useKioskFundsVoting, setKioskFundsVoting ] = useState(settings.useKioskFundsVoting);
	const [ formatAsDollars, setFormatAsDollars ]      = useState(settings.formatAsDollars);

	const handleSubmit = (e) => {
		e.preventDefault();

		let data = {
			theme: { title, question, chitWeight, matchRatio, leverageTotal, consolationActive, consolationAmount },
			settings: { timerLength, useKioskChitVoting, useKioskFundsVoting, formatAsDollars }
		};

		// Iterate over database objects with keys to be saved
		_.forEach(data, (value, dataKey) => {
			// In each object, delete keys which haven't changed
			_.keys(data[dataKey]).map(key => {
				// I know we shouldn't use eval; Justification:
				// Values being eval'd are not from user, the only way to have dynamic variable names in JS
				if(eval(key) === eval(dataKey)[key]) {
					delete data[dataKey][key];
				}
			});
		});

		// Only update if data has changed
		if(!_.isEmpty(data.theme)) {
			ThemeMethods.update.call({
				id: theme._id,
				data: data.theme
			});
		}

		if(!_.isEmpty(data.settings)) {
			PresentationSettingsMethods.update.call({
				id: settings._id,
				data: data.settings
			});
		}
	};

	if(!theme) return(<Loader/>);

	return (
		<>
		<h1>Test</h1>
		<Form.Input value={ theme.title || '' } onChange={ e => theme.updateTheme('title', e.target.value) } />

		<Form onBlur={ handleSubmit } onSubmit={ handleSubmit }>

			{/* Title */}
			<Form.Field>
				<Form.Input 
					name='theme.title' 
					type='text' 
					placeholder='Title' 
					label='Theme Title' 
					value={ title } 
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
					value={ question } 
					onChange={ e => setQuestion(e.target.value) } 
				/>
			</Form.Field>

			{/* Total Leverage Amount */}
			<Form.Group>
				<Form.Input 
					name='theme.leverageTotal' 
					icon='dollar sign' 
					iconPosition='left' 
					label='Total Pot' 
					placeholder='Total Pot' 
					value={ leverageTotal } 
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
					value={ timerLength } 
					onChange={ e => setTimerLength(e.target.value) } 
				/>

				{/* Chit Weigh */}
				<Form.Input 
					name='theme.chitWeight' 
					type='number' 
					placeholder='Chit Weight' 
					label='Chit weight in ounces' 
					value={ chitWeight } 
					onChange={ e => setChitWeight(e.target.value) } 
				/>

				{/* Match Ratio */}
				<Form.Input 
					name='theme.matchRatio' 
					type='number' 
					placeholder='Match Ratio' 
					label='Multiplier for matched funds' 
					value={ matchRatio } 
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
						checked={ useKioskChitVoting } 
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
						checked={ useKioskFundsVoting } 
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
					value={ consolationAmount } 
					onChange={ e => setConsolationAmount(e.target.value) } 
				/>

				{/* Consolation Active */}
				<Form.Checkbox 
					toggle 
					name='theme.consolationActive' 
					label='Use Consolation?' 
					checked={ consolationActive } 
					onChange={ (e, value) => setConsolationActive(value.checked) } 
				/>
			</Form.Group>

			<Form.Group>
				<Form.Field>
					<label>Number Format</label>
					<Label>%</Label>
					<Checkbox
						slider 
						name='settings.formatAsDollars'
						style={ { 'verticalAlign': 'middle' } } 
						checked={ formatAsDollars }
						onChange={ (e, value) => setFormatAsDollars(value.checked) } 
					/>
					<Label>$</Label>
				</Form.Field>
			</Form.Group>
		</Form>
		</>
	);
});

export default SettingsPane;
