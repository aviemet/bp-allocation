import React, { useState, useEffect } from 'react';
import _ from 'lodash';

import { Table, Input } from 'semantic-ui-react';

import { OrganizationMethods } from '/imports/api/methods';

const ChitInputs = props => {

	const [ weightVotes, setWeightVotes ] = useState(props.org.chitVotes.weight);
	const [ countVotes, setCountVotes ]   = useState(props.org.chitVotes.count);

	useEffect(() => {
		if(weightVotes !== props.org.chitVotes.weight || countVotes !== props.org.chitVotes.count) {

			OrganizationMethods.update.call({
				id: props.org._id,
				data: {
					chitVotes: {
						count: countVotes,
						weight: weightVotes
					}
				}
			});
		}
	});

	return (
		<Table.Row>

			<Table.Cell collapsing>
				{props.org.title}
			</Table.Cell>

			<Table.Cell collapsing>
				<Input
					name='weightVotes'
					type='number'
					tabIndex={props.tabInfo.index}
					fluid
					value={weightVotes || ''}
					onChange={e => setWeightVotes(e.target.value ? parseFloat(e.target.value) : 0)}
				/>
			</Table.Cell>

			<Table.Cell collapsing>
				<Input
					name='countVotes'
					type='number'
					tabIndex={props.tabInfo.index + props.tabInfo.length}
					fluid
					value={countVotes || ''}
					onChange={e => setCountVotes(e.target.value ? parseFloat(e.target.value) : 0)}
				/>
			</Table.Cell>

		</Table.Row>
	);
}

export default ChitInputs;
