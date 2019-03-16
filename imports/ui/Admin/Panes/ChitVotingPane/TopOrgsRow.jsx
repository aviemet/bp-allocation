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
	}

	_isLocked = () => this.props.theme.topOrgsManual.includes(this.props.org._id);

	_isSaved = () => (_.findIndex(this.props.theme.saves, ['org', this.props.org._id]) >= 0);

	/**
	 * Manually pins an organization as a "Top Org"
	 */
	topOrgToggle = (e, data) => {
		ThemeMethods.topOrgToggle.call({
			theme_id: this.props.theme._id,
			org_id: this.props.org._id
		}, (err, res) => {});
	}

	render() {
		return(
			<Table.Row positive={this.props.inTopOrgs}>
				<Table.Cell>
					{this.props.org.title}
					{!this.props.inTopOrgs && <SaveButton org={this.props.org} />}
				</Table.Cell>
				<Table.Cell>{ Number( parseFloat(this.props.org.votes).toFixed(1) ) }</Table.Cell>
				<Table.Cell>
					<Checkbox
						toggle
						onChange={this.topOrgToggle}
						checked={this._isLocked()}
						disabled={!!this._isSaved()}
					/>
				</Table.Cell>
			</Table.Row>
		);
	}
}
