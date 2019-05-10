import React, { useState, useContext } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import _ from 'lodash';
import numeral from 'numeral';

import { ThemeContext } from '/imports/context';
import { ThemeMethods } from '/imports/api/methods';

import { Button, Modal } from 'semantic-ui-react';
import styled from 'styled-components';

import { roundFloat } from '/imports/utils';

import SaveButton from './SaveButton';

const UnSaveButton = props => {

	const [ amount, setAmount ]       = useState('');
	const [ modalOpen, setModalOpen ] = useState(false);

	const { theme } = useContext(ThemeContext);

	const unSaveOrg = () => {
		ThemeMethods.unSaveOrg.call({
			theme_id: theme._id,
			org_id: props.org._id
		});
		setModalOpen(false);
	}

	const save = _.find(theme.saves, ['org', props.org._id]);

	return (
		<Modal
			size='tiny'
			open={modalOpen}
			onClose={() => setModalOpen(false)}
			trigger={
				<Button
					onClick={() => setModalOpen(true)}
					content='Un-Save'
					color='red'
					labelPosition='left'
					label={{ basic: true, color: 'black', pointing: 'right', content: `Saved for ${numeral(save.amount).format('$0,0')}`}}
				/>
			}
		>
			<Modal.Header>Un-Saving {props.org.title}</Modal.Header>
			<Modal.Content>
				<Modal.Description>
					<p>Are you sure you want to un-save this organization?</p>
				</Modal.Description>
			</Modal.Content>
			<Modal.Actions>
				<Button onClick={() => setModalOpen(false)} positive>No</Button>
				<Button
					onClick={unSaveOrg}
					negative
					labelPosition='right'
					icon='trash'
					content='Yes'
				/>
			</Modal.Actions>
		</Modal>
	);
}

export default UnSaveButton;
