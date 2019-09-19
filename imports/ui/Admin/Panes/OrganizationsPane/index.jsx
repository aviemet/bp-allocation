import React, { useState } from 'react';

import { observer } from 'mobx-react-lite';
import { useData } from '/imports/stores/DataProvider';

import { OrganizationMethods } from '/imports/api/methods';

import { Header, Grid, Form, Container } from 'semantic-ui-react';

import OrgInputs from './OrgInputs';
import ImportOrgs from './ImportOrgs';

const OrganizationsPane = observer(props => {
	const data = useData();
	const { theme } = data;
	const orgs = data.orgs.values;

	const [ orgTitle, setOrgTitle ] = useState('');
	const [ orgAsk, setOrgAsk ]     = useState('');

	const handleNewOrgSubmit = (e) => {
		e.preventDefault();

		e.target.reset();

		let data = {
			title: orgTitle,
			ask: orgAsk,
			theme: theme._id
		};

		OrganizationMethods.create.call(data, (err, res) => {
			if(err){
				console.error(err);
			} else {
				setOrgTitle('');
				setOrgAsk('');
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

						<Form.Button width={ 2 } type='submit'>Add</Form.Button>
					</Form.Group>
				</Form>

			</Grid.Row>
			
			{orgs.map((org, i) => <OrgInputs org={ org } key={ i } /> )}

		</Container>
	);
});

export default OrganizationsPane;
