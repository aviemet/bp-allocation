import React, { useState } from 'react';
import { readCsvWithHeadings } from '/imports/lib/papaParseMethods';

import { observer } from 'mobx-react-lite';
import { useData } from '/imports/api/providers';
import { OrganizationMethods } from '/imports/api/methods';

import CustomMessage from '/imports/ui/Components/CustomMessage';
import { Button, Input } from 'semantic-ui-react';

const ImportOrgs = observer(props => {
	const { themeId } = useData();
	
	const [ importResponseMessageVisible, setImportResponseMessageVisible ] = useState(false);
	const [ importReponseMessage, setImportResponseMessage ] = useState('');
	const [ loading, setLoading ] = useState(false);


	const showImportResponseMessage = () => {
		setImportResponseMessageVisible(true);

		setTimeout(() => setImportResponseMessageVisible(false), 10000);
	};

	const hideImportResponseMessage = () => setImportResponseMessageVisible(false);

	// let skipped = [];

	// let uploadedOrgsList = [];
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
		{
			name: 'description',
			forms: ['description', 'desc', 'about', 'details', 'info'],
			type: String
		}
	];

	const clickFileInput = () => document.getElementById('fileInput').click();

	const importOrgs = e => {
		const MIN_LOADING_SECONDS = 2;
		const start = new Date();
		setLoading(true);

		const file = e.currentTarget.files[0];

		// TODO: Display error message on error
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
				// console.log({ afterRowParse: row });
				// TODO: That object key can't be right... 'Id'?... hmmmmmmmm
				OrganizationMethods.create.call(Object.assign({ Id: themeId }, row));
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
					setImportResponseMessage(`Successfully imported ${data.length} organizations`);
					showImportResponseMessage();
				}, timeout);
			}
		});
		return parser;
	};
	/*
	const parseFile = e => {
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
						}
					}
				});

				let complete = true;
				acceptedValues.map(values => {
					if(!row.hasOwnProperty(values.name)) {
						complete = false;
						skipped.push({ raw: results.data[0], row });
						console.error('FAILED');
					}
				});

				if(complete) {
					OrganizationMethods.create.call(Object.assign({ theme: theme._id }, row));
				}

				uploadedOrgsList.push(row);

			},
			complete: results => {
				
			}
		});
		return parser;
	};
*/
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
				onChange={ importOrgs }
			/>
			{ importResponseMessageVisible && <CustomMessage 
				positive 
				onDismiss={ hideImportResponseMessage }
				heading='Import Successful'
				body={ importReponseMessage }
			/> }
		</React.Fragment>
	);
});

export default ImportOrgs;
