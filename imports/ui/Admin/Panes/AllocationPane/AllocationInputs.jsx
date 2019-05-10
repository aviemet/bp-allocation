import React from 'react';
import _ from 'lodash';
import numeral from 'numeral';

import { getSaveAmount, roundFloat } from '/imports/utils';

import { OrganizationMethods, ThemeMethods } from '/imports/api/methods';

import { Table, Checkbox, Button, Form, Dropdown, Input, Label } from 'semantic-ui-react';

const actionOptions = [
	{ key: 'actions', text: 'Actions', value: 'actions' },
	{ key: 'topOff', text: 'Top Off', value: 'topff' },
	{ key: 'reset', text: 'Reset', value: 'reset' }
];

/**
 * Allocation Inputs Component
 */
const AllocationInputs = props => {

	const enterAmountFromVotes = (e, data) => {
		if(data.value !== props.org.amountFromVotes){
			OrganizationMethods.update.call({id: props.org._id, data: {
				amountFromVotes: data.value
			}});
		}
	}

	const pledge = (e, data) => {
		e.preventDefault();

		let amount = roundFloat(e.target.elements.valueInput.value);

		OrganizationMethods.pledge.call({
			id: props.org._id,
			amount: amount,
		});

		// Clear the input
		e.target.elements.valueInput.value = '';
	}

	const handleActionSelection = (e, data) => {
		switch(data.value){
			case actionOptions[1].value: // topOff
				OrganizationMethods.topOff.call({id: props.org._id});
				break;
			case actionOptions[2].value: // reset
				OrganizationMethods.reset.call({id: props.org._id});
				break;
		}
	}

	// Initialize to 0 if empty so it's truthiness can be read
	const amountFromVotes = props.org.amountFromVotes || 0;

	// Boolean help for marking fully funded orgs
	const reachedGoal = props.org.need <= 0;

	return (
		<Table.Row positive={reachedGoal}>

			{/* Org Title */}
			<Table.Cell>
				<CrowdFavoriteRibbon crowdFavorite={props.crowdFavorite || false}>
					{props.org.title}
				</CrowdFavoriteRibbon>
			</Table.Cell>

			{/* Voted Amount Input */}
			<Table.Cell>
				<Input
					fluid
					type='number'
					value={props.org.amountFromVotes || ''}
					onChange={enterAmountFromVotes}
					tabIndex={props.tabInfo ? props.tabInfo.index : false}
				/>
			</Table.Cell>

			{/* Matched Pledges Input */}
			<Table.Cell>
				<Form onSubmit={pledge}>
					<Form.Input
						fluid
						type='text'
						name='valueInput'
						action='+'
						tabIndex={props.tabInfo ? props.tabInfo.index + props.tabInfo.length : false}
					/>
				</Form>
			</Table.Cell>

			{/* Funded */}
			<Table.Cell className={reachedGoal ? 'bold' : ''}>
				{numeral(props.org.allocatedFunds).format('$0,0')}
			</Table.Cell>

			{/* Ask */}
			<Table.Cell className={reachedGoal ? 'bold' : ''}>
				{numeral(props.org.ask).format('$0,0')}
			</Table.Cell>

			{/* Need */}
			<Table.Cell>
				{numeral(props.org.need).format('$0,0.00')}
			</Table.Cell>

			{/* Actions */}
			<Table.Cell singleLine>
				<Dropdown
					floating
					button
					text='Actions'
					options={actionOptions}
					onChange={handleActionSelection}
				/>
			</Table.Cell>
		</Table.Row>
	);
}

export default AllocationInputs;

/**
 * Adorn table row with a ribbon for the crowd favorite
 */
const CrowdFavoriteRibbon = props => {
	if(props.crowdFavorite === false){
		return <React.Fragment>{props.children}</React.Fragment>
	}
	return <Label ribbon color='green'>{props.children}: Crowd Favorite</Label>
}
