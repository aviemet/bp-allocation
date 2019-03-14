import React from 'react';

import { Table, Input } from 'semantic-ui-react';

import { OrganizationMethods } from '/imports/api/methods';

export default class ChitInputs extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			weightVotes: this.props.organization.chitVotes.weight || '',
			countVotes: this.props.organization.chitVotes.count || ''
		}

		 this.updateChitVotes = this.updateChitVotes.bind(this);
	}

	updateChitVotes = (e, data) => {
		let newState = {};
		newState[data.name] = data.value;

		this.setState(newState, () => {

			OrganizationMethods.update.call({
				id: this.props.organization._id,
				data: {
					chitVotes: {
						weight: this.state.weightVotes,
						count: this.state.countVotes
					}
				}
			});

		});
	}

	render() {
		return (
			<Table.Row>

				<Table.Cell collapsing>
					{this.props.organization.title}
				</Table.Cell>

				<Table.Cell collapsing>
					<Input type='number' name='weightVotes' value={this.state.weightVotes} onChange={this.updateChitVotes} fluid tabIndex={this.props.tabInfo.index} />
				</Table.Cell>

				<Table.Cell collapsing>
					<Input type='number' name='countVotes' value={this.state.countVotes} onChange={this.updateChitVotes} fluid tabIndex={this.props.tabInfo.index + this.props.tabInfo.length} />
				</Table.Cell>

			</Table.Row>
		);
	}
}
