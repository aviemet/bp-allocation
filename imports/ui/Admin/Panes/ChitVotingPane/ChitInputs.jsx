import React from 'react';
import _ from 'lodash';

import { Table, Input } from 'semantic-ui-react';

import { OrganizationMethods } from '/imports/api/methods';

class ChitInputs extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			weightVotes: props.org.chitVotes.weight,
			countVotes: props.org.chitVotes.count
		};
	}

	componentDidUpdate = (prevProps, prevState) => {
		if(this.props.org.chitVotes.weight !== this.state.weightVotes && prevProps.org.chitVotes !== this.state.weightVotes) {
			this.setState({
				weightVotes: this.props.org.chitVotes.weight
			});
		}
	}

	saveVotes = () => {
		OrganizationMethods.update.call({
			id: this.props.org._id,
			data: {
				chitVotes: {
					count: this.state.countVotes,
					weight: this.state.weightVotes
				}
			}
		});
	}

	render() {
		return (
			<Table.Row>

				<Table.Cell collapsing>
					{this.props.org.title}
				</Table.Cell>

				<Table.Cell collapsing>
					<Input
						name='weightVotes'
						type='number'
						tabIndex={this.props.tabInfo.index}
						fluid
						value={this.state.weightVotes || ''}
						onChange={e => {
							this.setState({
								weightVotes:e.currentTarget.value ? parseFloat(e.currentTarget.value) : 0
							}, this.saveVotes);
						}}
					/>
				</Table.Cell>

				<Table.Cell collapsing>
					<Input
						name='countVotes'
						type='number'
						tabIndex={this.props.tabInfo.index + this.props.tabInfo.length}
						fluid
						value={this.state.countVotes || ''}
						onChange={e => {
							this.setState({
								countVotes:e.currentTarget.value ? parseFloat(e.currentTarget.value) : 0
							}, this.saveVotes);
						}}
					/>
				</Table.Cell>

			</Table.Row>
		);
	}
}

export default ChitInputs;
