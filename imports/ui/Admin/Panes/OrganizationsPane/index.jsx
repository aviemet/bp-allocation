import React, { useState } from 'react';
import _ from 'lodash';

import { useTheme, useOrgs, useImages } from '/imports/stores/AppContext';

import { OrganizationMethods } from '/imports/api/methods';

import { Loader, Header, Grid, Form, Container } from 'semantic-ui-react';

import OrgInputs from './OrgInputs';
import FileUpload from '/imports/ui/Components/FileUpload';
import ImportOrgs from './ImportOrgs';

const OrganizationsPane = props => {

	const theme = useTheme();
	const orgs = useOrgs();
	const images = useImages();

	if(!theme || !orgs) return <Loader />;

	const [ orgTitle, setOrgTitle ]                  = useState('');
	const [ orgAsk, setOrgAsk ]                      = useState('');
	const [ orgImage, setOrgImage ]                  = useState('');
	const [ addButtonDisabled, setAddButtonDisabled] = useState(false);

	const fileError = (error, file) => {
		console.error({ error: error, file: file });
	};

	const handleNewOrgSubmit = (e) => {
		e.preventDefault();

		e.target.reset();

		let data = {
			title: orgTitle,
			ask: orgAsk,
			image: orgImage,
			theme: theme._id
		};

		OrganizationMethods.create.call(data, (err, res) => {
			if(err){
				console.error(err);
			} else {
				setOrgTitle('');
				setOrgAsk('');
				setOrgImage('');
			}
		});
	};

	return (
		<Container>
			<Grid.Row>
				<Header as="h1">
					Organizations for Theme: { theme.title }
					<ImportOrgs />
				</Header>
			</Grid.Row>

			<Grid.Row>

				<Form onSubmit={ handleNewOrgSubmit }>
					<Form.Group>
						<Form.Input
							name='orgTitle'
							width={ 6 }
							type='text'
							placeholder='Organization Name'
							value={ orgTitle }
							onChange={ e => setOrgTitle(e.target.value) }
						/>

						<Form.Input
							name='orgAsk'
							width={ 2 }
							type='text'
							placeholder='Ask'
							iconPosition='left'
							icon='dollar sign'
							value={ orgAsk }
							onChange={ e => setOrgAsk(e.target.value) }
						/>

						<FileUpload
							name='orgImage'
							width={ 4 }
							onEnd={ ({ file }) => setOrgImage(file._id || false) }
							onStart={ () => setAddButtonDisabled(true) }
							onUploaded={ () => setAddButtonDisabled(false) }
							onError={ fileError }
						/>

						<Form.Button width={ 2 } type='submit' disabled={ addButtonDisabled }>Add</Form.Button>
					</Form.Group>
				</Form>

			</Grid.Row>
			
			{orgs.map((org, i) => <OrgInputs org={ org } image={ _.find(images, { '_id': org.image }) } key={ i } /> )}

		</Container>
	);
};

export default OrganizationsPane;
