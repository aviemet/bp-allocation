import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import _ from 'lodash';

import { Organizations } from '/imports/api';
import { ThemeMethods } from '/imports/api/methods';

import { Table, Checkbox, Icon, Input, Header, Button } from 'semantic-ui-react';
import styled from 'styled-components';

import { roundFloat } from '/imports/utils';

import SaveButton from './SaveButton';

const TopOrgsRow = props => {
	/**
	 * Manually pins an organization as a "Top Org"
	 */
	const topOrgToggle = (e, data) => {
		ThemeMethods.topOrgToggle.call({
			theme_id: props.themeId,
			org_id: props.org._id
		}, (err, res) => {});
	}

	return(
		<Table.Row positive={props.inTopOrgs}>
			<Table.Cell>
				{props.org.title}
				{!props.inTopOrgs && <SaveButton org={props.org} />}
			</Table.Cell>
			<Table.Cell>{ roundFloat(props.org.votes, 1) }</Table.Cell>
			<Table.Cell>
				<Checkbox
					toggle
					onChange={topOrgToggle}
					checked={props.isLocked || false}
					disabled={!!props.isSaved || false}
				/>
			</Table.Cell>
		</Table.Row>
	);
}


export default TopOrgsRow;
