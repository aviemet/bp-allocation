import React from 'react';
import PropTypes from 'prop-types';
import numeral from 'numeral';

import { usePresentationSettings } from '/imports/context';

import { roundFloat } from '/imports/utils';

import { OrganizationMethods } from '/imports/api/methods';

import CrowdFavoriteRibbon from '/imports/ui/Components/CrowdFavoriteRibbon';

import { Table, Button, Form, Input } from 'semantic-ui-react';

/**
 * Allocation Inputs Component
 */
const AllocationInputs = props => {

	const { settings } = usePresentationSettings();

	/*
	const actionOptions = [
		{ key: 'actions', text: 'Actions', value: 'actions' },
		{ key: 'topOff', text: `${props.org.topOff > 0 ? 'Undo Top Off' : 'Top Off'}`, value: 'topoff' },
		{ key: 'reset', text: 'Reset', value: 'reset' }
	];
	*/

	const enterAmountFromVotes = (e, data) => {
		if(data.value !== props.org.amountFromVotes){
			OrganizationMethods.update.call({ id: props.org._id, data: {
				amountFromVotes: data.value
			}});
		}
	};

	const pledge = (e, data) => {
		e.preventDefault();

		let amount = roundFloat(e.target.elements.valueInput.value);

		OrganizationMethods.pledge.call({
			id: props.org._id,
			amount: amount,
		});

		// Clear the input
		e.target.elements.valueInput.value = '';
	};

	/*
	const handleActionSelection = (e, data) => {
		switch(data.value){
		case actionOptions[1].value: // topOff
			if(props.org.topOff > 0) {
				OrganizationMethods.topOff.call({ id: props.org._id, negate: true });
			} else {
				OrganizationMethods.topOff.call({ id: props.org._id });
			}
			break;
		case actionOptions[2].value: // reset
			OrganizationMethods.reset.call({ id: props.org._id });
			break;
		}
	};*/

	const topoff = () => {
		const amount = props.org.topOff > 0 ? 0 : props.org.need - props.org.leverageFunds;
		OrganizationMethods.update.call({ id: props.org._id, data: {
			topOff: amount
		}});
	};

	// Boolean help for marking fully funded orgs
	const reachedGoal = props.org.need - props.org.leverageFunds <= 0;
	return (
		<Table.Row positive={ reachedGoal }>

			{/* Org Title */}
			<Table.Cell>
				<CrowdFavoriteRibbon crowdFavorite={ props.crowdFavorite || false }>
					{props.org.title}
				</CrowdFavoriteRibbon>
			</Table.Cell>

			{/* Voted Amount Input */}
			<Table.Cell>
				{props.hideAdminFields || settings.useKioskFundsVoting ?
					<span>{numeral(props.org.amountFromVotes || 0).format('$0,0')}</span>
					:
					<Input
						fluid
						type='number'
						value={ props.org.amountFromVotes || '' }
						onChange={ enterAmountFromVotes }
						tabIndex={ props.tabInfo ? props.tabInfo.index : false }
					/>
				}
			</Table.Cell>

			{/* Matched Pledges Input */}
			<Table.Cell>
				{props.hideAdminFields ?
					numeral(props.org.pledges.reduce((sum, pledge) => { return sum + pledge.amount; }, 0)).format('$0,0')
					:
					<Form onSubmit={ pledge }>
						<Form.Input
							fluid
							type='text'
							name='valueInput'
							action='+'
							tabIndex={ props.tabInfo ? props.tabInfo.index + props.tabInfo.length : false }
						/>
					</Form>
				}
			</Table.Cell>

			{/* Funded */}
			<Table.Cell className={ reachedGoal ? 'bold' : '' }>
				{numeral(props.org.allocatedFunds).format('$0,0')}
			</Table.Cell>

			{/* Ask */}
			<Table.Cell className={ reachedGoal ? 'bold' : '' }>
				{numeral(props.org.ask).format('$0,0')}
			</Table.Cell>

			{/* Need */}
			<Table.Cell>
				{numeral(props.org.need - props.org.leverageFunds).format('$0,0')}
			</Table.Cell>

			{/* Actions */}
			{!props.hideAdminFields &&
			<Table.Cell singleLine>
				<Button onClick={ topoff } style={ { width: '100%' } }>{props.org.topOff > 0 ? 'Undo' : '' } Top Off</Button>
				{/*<Dropdown
					floating
					button
					text='Actions'
					options={actionOptions}
					onChange={handleActionSelection}
				/>*/}
			</Table.Cell>}
		</Table.Row>
	);
};

AllocationInputs.propTypes = {
	org: PropTypes.object,
	crowdFavorite: PropTypes.bool,
	tabInfo: PropTypes.object,
	hideAdminFields: PropTypes.bool
};

export default AllocationInputs;