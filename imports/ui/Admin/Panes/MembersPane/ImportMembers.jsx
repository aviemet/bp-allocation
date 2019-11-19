import React, { useState } from 'react';

import { readCsvWithHeadings, sanitizeNames } from '/imports/lib/utils';
// import { parsePhoneNumberFromString } from 'libphonenumber-js';

import { useData } from '/imports/stores/DataProvider';
import { MemberMethods } from '/imports/api/methods';

import { Button, Input } from 'semantic-ui-react';

const ImportMembers = props => {
	const data = useData();
	const { theme } = data || {};

	const [ loading, setLoading ] = useState(false);

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
		},
		{
			name: 'phone',
			forms: ['phone', 'phone number', 'phone no', 'mobile', 'mobile number', 'mobile no'],
			type: String
		}
	];

	const clickFileInput = () => document.getElementById('fileInput').click();

	const importMembers = e => {
		const MIN_LOADING_SECONDS = 3;
		const start = new Date();
		setLoading(true);

		const file = e.currentTarget.files[0];

		// TODO: Display loading indicator while uploading members
		const parser = readCsvWithHeadings(file, acceptedValues, {
			'beforeInferHeadings': headings => {
				// console.log({ beforeInferHeadings: headings });
			},
			'afterInferHeadings': headings => {
				// console.log({ afterInferHeadings: headings });
			},
			'beforeRowParse': row => {
				// console.log({ beforeRowParse: row });
			},
			'afterRowParse': row => {
				// console.log({ afterRowParse: row });
				if(row.hasOwnProperty('fullName') && row.fullName.includes(',')) {
					row.fullName = sanitizeNames(row.fullName);
				}
				// console.log({ afterRowParse: row });
				MemberMethods.upsert.call(Object.assign({ themeId: theme._id }, row));
			},
			'onComplete': data => {
				// Display loading icon in button for a minimum amount of time
				let timeout = 0;
				const now = new Date();
				if((now - start) / 1000 < MIN_LOADING_SECONDS) {
					timeout = (MIN_LOADING_SECONDS * 1000) - (now - start);
				}
				setTimeout(() => {
					setLoading(false);
				}, timeout);
			}
		});
		return parser;
	};

	console.log({ loading });

	return (
		<React.Fragment>
			<Button
				style={ { float: 'right' } }
				onClick={ clickFileInput }
				loading={ loading }
			>
			Import List as .csv
			</Button>
			<Input
				type='file'
				id='fileInput'
				name='fileInput'
				accept='.csv'
				style={ { display: 'none' } }
				onChange={ importMembers }
			/>
		</React.Fragment>
	);
};

ImportMembers.propTypes = {};

export default ImportMembers;
