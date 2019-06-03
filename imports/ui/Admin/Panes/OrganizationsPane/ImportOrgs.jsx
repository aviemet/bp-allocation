import React from 'react';
import Papa from 'papaparse';
import _ from 'lodash';

import { useTheme } from '/imports/context';
import { OrganizationMethods } from '/imports/api/methods';

import { Button, Input } from 'semantic-ui-react';

const ImportOrgs = props => {

	const { theme } = useTheme();

	let skipped = [];

	let uploadedOrgsList = [];
	const acceptedValues = [
		{
			name: 'title',
			forms: ['title', 'org', 'organization', 'name', 'org name', 'organization name'],
			type: String
		},
		{
			name: 'ask',
			forms: ['ask', 'amount'],
			type: value => parseInt(value.replace(/[^0-9]+/g, ''))
		},
	];

	const clickFileInput = () => document.getElementById('fileInput').click();

	const doThing = e => {
		let file = e.currentTarget.files[0];

		let parser = Papa.parse(file, {
			header: true,
			dynamicTyping: true,
			skipEmptyLines: true,
			step: (results, parser) => {
				let row = {};

				_.forEach(results.data[0], (value, key) => {
					const matchKey = key.trim().toLowerCase();

					let matched = false;
					for(let i = 0; !matched && i < acceptedValues.length; i++) {
						const formsIndex = _.indexOf(acceptedValues[i].forms, matchKey);

						if(formsIndex >= 0) {
							matched = true;
							row[acceptedValues[i].name] = acceptedValues[i].type(value);
							console.log({row, type: acceptedValues[i].type, value});
						}
					}
				});

				let complete = true;
				acceptedValues.map(values => {
					if(!row.hasOwnProperty(values.name)) {
						complete = false;
						skipped.push({raw: results.data[0], row});
						console.log("FAILED");
					}
				})

				if(complete) {
					 OrganizationMethods.create.call(Object.assign({theme: theme._id}, row));
				}

				uploadedOrgsList.push(row);

			},
			complete: results => {
				console.log(results.data);
				console.log({uploadedOrgsList});
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

export default ImportOrgs;
