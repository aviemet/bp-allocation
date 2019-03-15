import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import _ from 'lodash';

import { Organizations } from '/imports/api';
import { ThemeMethods } from '/imports/api/methods';

import { Table, Checkbox, Icon, Input, Header, Button } from 'semantic-ui-react';
import styled from 'styled-components';

import SaveButton from './SaveButton';

export default class TopOrgsRow extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			locked: props.theme.topOrgsManual.includes(props.org._id),
			saved: (_.findIndex(props.theme.saves, ['org', props.org._id]) >= 0)
		}
	}

	componentDidUpdate = (prevProps, prevState) => {
		let newState = {};

		let locked = this.props.theme.topOrgsManual.includes(this.props.org._id);
		let saved = (_.findIndex(this.props.theme.saves, ['org', this.props.org._id]) >= 0);

		if(this.state.locked !== locked) {
			newState.locked = locked;
		}

		if(this.state.saved !== saved) {
			newState.saved = saved;
		}

		if(!_.isEmpty(newState)) {
			this.setState(newState);
		}
	}

	/**
	 * Manually pins an organization as a "Top Org"
	 */
	topOrgToggle = (e, data) => {
		console.log({
			theme_id: this.props.theme._id,
			org_id: this.props.org._id
		});
		ThemeMethods.topOrgToggle.call({
			theme_id: this.props.theme._id,
			org_id: this.props.org._id
		}, (err, res) => {
			console.log({topOrgs: this.props.theme.topOrgsManual, org: this.props.org._id});
			this.setState({
				locked: this.props.theme.topOrgsManual.includes(this.props.org._id)
			});
			console.log(this.state);
		});
	}

	render() {
		// console.log('TopOrgsRow rendered');
		return(
			<Table.Row positive={this.props.inTopOrgs}>
				<Table.Cell>
					{this.props.org.title}
					{!this.props.inTopOrgs && <SaveButton org={this.props.org} />}
				</Table.Cell>
				<Table.Cell>{ Number( parseFloat(this.props.org.votes).toFixed(1) ) }</Table.Cell>
				<Table.Cell><Checkbox toggle onChange={this.topOrgToggle} checked={this.state.locked} disabled={!!this.state.saved} /></Table.Cell>
			</Table.Row>
		);
	}
}
