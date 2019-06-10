import React from 'react';
import Papa from 'papaparse';
import _ from 'lodash';

import { readCsvWithHeadings } from '/imports/utils';

import { useTheme } from '/imports/context';
import { MemberMethods } from '/imports/api/methods';

import { Button, Input } from 'semantic-ui-react';

const ImportMembers = props => {

	const { theme } = useTheme();

	let skipped = [];

	let uploadedMembersList = [];
	const acceptedValues = [
		{
			name: 'firstName',
			forms: ['firstname', 'first name', 'first', 'f_name', 'f name', 'f'],
			type: String
		},
		{
			name: 'lastName',
			forms: ['lastName', 'last name', 'last', 'l_name', 'l name', 'l'],
			type: String
		},
		{
			name: 'fullName',
			forms: ['name', 'member', 'member name', 'donor'],
			type: String
		},
		{
			name: 'number',
			forms: ['number', 'member', 'member number', 'membernumber', 'member_number', 'member #', 'no', 'no.', 'num', '#'],
			type: val => typeof val === 'string' ? parseInt(val.replace(/[^0-9.]/g, '')) : val
		},
		{
			name: 'amount',
			forms: ['amount', 'money', 'donated', 'donations', 'given', 'funds', 'dollars'],
			type: val => typeof val === 'string' ? parseInt(val.replace(/[^0-9.]/g, '')) : val
		},
		{
			name: 'initials',
			forms: ['initials', 'init', 'inits'],
			type: String
		}
	];

	const clickFileInput = () => document.getElementById('fileInput').click();

	importMembers = e => {
		const file = e.currentTarget.files[0];

		const parser = readCsvWithHeadings(file, acceptedValues, {
			'beforeInferHeadings': headings => {
				// console.log({beforeInferHeadings: headings});
			},
			'afterInferHeadings': headings => {
				// console.log({afterInferHeadings: headings});
			},
			'beforeRowParse': row => {
				// console.log({beforeRowParse: row});
			},
			'afterRowParse': row => {
				// console.log({afterRowParse: row});
				MemberMethods.upsert.call(Object.assign({themeId: theme._id}, row));
			},
			'onComplete': data => {
				// console.log({onComplete: data});
			}
		});
	}

	return (
		<React.Fragment>
			<Button
				style={{float: "right"}}
				onClick={clickFileInput}
			>
			Import List as .csv
			</Button>
			<Input
				type='file'
				id='fileInput'
				name='fileInput'
				accept='.csv'
				style={{display: 'none'}}
				onChange={importMembers}
			/>
			</React.Fragment>
	);
}

export default ImportMembers;
