import React from 'react';
import Papa from 'papaparse';
import _ from 'lodash';

import { useTheme } from '/imports/context';
import { MemberMethods } from '/imports/api/methods';

import { Button, Input } from 'semantic-ui-react';

import NewMemberInputs from './NewMemberInputs';
import MembersList from './MembersList';

const MembersPane = props => {

	const { theme } = useTheme();

	let skipped = [];

	let uploadedMembersList = [];
	const acceptedValues = [
		{
			name: 'firstName',
			forms: ['firstname', 'first name', 'first', 'f_name', 'f name', 'f']
		},
		{
			name: 'lastName',
			forms: ['lastName', 'last name', 'last', 'l_name', 'l name', 'l']
		},
		{
			name: 'number',
			forms: ['number', 'member', 'member number', 'membernumber', 'member_number', 'no', 'no.', 'num', '#']
		},
		{
			name: 'amount',
			forms: ['amount', 'money', 'donated', 'donations', 'given', 'funds', 'dollars']
		}
	];

	const clickFileInput = () => document.getElementById('fileInput').click();

	const doThing = e => {
		let file = e.currentTarget.files[0];

		let parser = Papa.parse(file, {
			header: true,
			dynamicTyping: true,
			skipEmptyLines: true,
			step: (results, parser) => {
				// console.log(results.data);

				let memberRow = {};

				_.forEach(results.data[0], (value, key) => {
					const matchKey = key.trim().toLowerCase();
					// console.log({matchKey, key, value});
					let matched = false;
					for(let i = 0; !matched && i < acceptedValues.length; i++) {
						const formsIndex = _.indexOf(acceptedValues[i].forms, matchKey);
						// console.log({formsIndex});
						if(formsIndex >= 0) {
							matched = true;
							memberRow[acceptedValues[i].name] = value;
						}
					}
				});

				let complete = true;
				acceptedValues.map(values => {
					if(!memberRow.hasOwnProperty(values.name)) {
						complete = false;
						skipped.push({raw: results.data[0], memberRow});
						console.log("FAILED");
					}
				})

				if(complete) {
					 MemberMethods.upsert.call(Object.assign({themeId: theme._id}, memberRow));
					// console.log({memberRow});
				}

				uploadedMembersList.push(memberRow);

			},
			complete: results => {
				// console.log(results.data);
				// console.log({uploadedMembersList});
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
				onChange={doThing}
			/>
			</React.Fragment>
	);
}

export default MembersPane;
