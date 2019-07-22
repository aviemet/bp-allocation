import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import { Table, Input } from 'semantic-ui-react';

import { OrganizationMethods } from '/imports/api/methods';

const ChitInputs = props => {
	const [ weightVotes, setWeightVotes ] = useState(props.org.chitVotes.weight);
	const [ countVotes, setCountVotes ] = useState(props.org.chitVotes.count);

	useEffect(() => {
		setWeightVotes(props.org.chitVotes.weight);
	}, [props.org.chitVotes.weight]);
	/*
	componentDidUpdate = (prevProps, prevState) => {
		if(this.props.org.chitVotes.weight !== this.state.weightVotes && prevProps.org.chitVotes !== this.state.weightVotes) {
			this.setState({
				weightVotes: this.props.org.chitVotes.weight
			});
		}
	};*/

	const saveVotes = () => {
		OrganizationMethods.update.call({
			id: props.org._id,
			data: {
				chitVotes: {
					count: countVotes,
					weight: weightVotes
				}
			}
		});
	};

	return (
		<Table.Row>

			<Table.Cell collapsing>
				{props.org.title}
			</Table.Cell>

			<Table.Cell collapsing>
				<Input
					name='weightVotes'
					type='number'
					tabIndex={ props.tabInfo.index }
					fluid
					value={ weightVotes || '' }
					onChange={ e => {
						setWeightVotes(e.currentTarget.value ? parseFloat(e.currentTarget.value) : 0);
						saveVotes();
					} }
				/>
			</Table.Cell>

			<Table.Cell collapsing>
				<Input
					name='countVotes'
					type='number'
					tabIndex={ props.tabInfo.index + props.tabInfo.length }
					fluid
					value={ countVotes || '' }
					onChange={ e => {
						setCountVotes(e.currentTarget.value ? parseFloat(e.currentTarget.value) : 0);
						saveVotes();
					} }
				/>
			</Table.Cell>

		</Table.Row>
	);
};

ChitInputs.propTypes = {
	org: PropTypes.object,
	tabInfo: PropTypes.object,
};

export default ChitInputs;


/*
	onChange={ e => {
		this.setState({
			countVotes:e.currentTarget.value ? parseFloat(e.currentTarget.value) : 0
		}, this.saveVotes);
	} }




	onChange={ e => {
		setState({
			weightVotes:e.currentTarget.value ? parseFloat(e.currentTarget.value) : 0
		}, saveVotes);
	} }
*/