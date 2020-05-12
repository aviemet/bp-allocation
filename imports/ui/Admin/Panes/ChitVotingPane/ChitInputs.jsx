import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import { Table, Input } from 'semantic-ui-react';

import { OrganizationMethods } from '/imports/api/methods';
import { observer } from 'mobx-react-lite';

const ChitInputs = observer(props => {
	const [ weightVotes, setWeightVotes ] = useState(props.org.chitVotes.weight);
	const [ countVotes, setCountVotes ] = useState(props.org.chitVotes.count);

	useEffect(() => {
		saveVotes();
	}, [weightVotes, countVotes]);

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

			<Table.Cell 
				width={ 10 }
				positive={ props.positive }
			>
				{props.org.title}
			</Table.Cell>

			<Table.Cell width={ 3 }>
				<Input
					name='weightVotes'
					type='number'
					tabIndex={ props.tabInfo.index }
					fluid
					value={ weightVotes || '' }
					onChange={ e => setWeightVotes(e.currentTarget.value ? parseFloat(e.currentTarget.value) : 0) }	
				/>
			</Table.Cell>

			<Table.Cell width={ 3 }>
				<Input
					name='countVotes'
					type='number'
					tabIndex={ props.tabInfo.index + props.tabInfo.length || 0 }
					fluid
					value={ countVotes || '' }
					onChange={ e => setCountVotes(e.currentTarget.value ? parseFloat(e.currentTarget.value) : 0) }
				/>
			</Table.Cell>

		</Table.Row>
	);
});

ChitInputs.propTypes = {
	org: PropTypes.object,
	tabInfo: PropTypes.object,
	positive: PropTypes.bool
};

export default ChitInputs;