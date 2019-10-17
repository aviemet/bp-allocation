import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { OrganizationMethods } from '/imports/api/methods';

import { Button, Form, Icon, Modal } from 'semantic-ui-react';

const OrgInputs = ({ org }) =>  {

	const [ orgTitle, setOrgTitle ] = useState(org.title);
	const [ orgAsk, setOrgAsk ] = useState(org.ask);

	// Write to DB for all inputs
	const handleOrgUpdate = (e) => {
		if(e)	e.preventDefault();

		// Only update the document if data has changed
		if(orgTitle !== org.title ||
				orgAsk  !== org.ask) {

			OrganizationMethods.update.call({ id: org._id, data: {
				title: orgTitle,
				ask: orgAsk
			}}, (err, res) => {
				if(err){
					console.error(err);
				} else {
					// Success
				}
			});
		}
	}

	const removeOrg = (e) => {
		e.preventDefault();
		OrganizationMethods.remove.call(org._id, (err, res) => {
			if(err) console.error(err);
		});
	};

	return(

		<Form organization={ org._id } onSubmit={ handleOrgUpdate } onBlur={ handleOrgUpdate }>
			<Form.Group>
				<Form.Input 
					width={ 6 } 
					type='text' 
					placeholder='Organization Name' 
					value={ orgTitle } 
					onChange={ e => setOrgTitle(e.currentTarget.value) } 
					name='orgTitle' 
				/>

				<Form.Input 
					width={ 2 } 
					type='text' 
					placeholder='Ask' 
					iconPosition='left' 
					icon='dollar sign' 
					value={ orgAsk } 
					onChange={ e => setOrgAsk(e.currentTarget.value) } 
					name='orgAsk' 
				/>

				<Modal
					centered={ false }
					trigger={ <Button icon><Icon name='trash' /></Button> }
					header={ 'Confirm Delete' }
					content={ `Are you sure you want to permanently delete the organization: ${org.title}?` }
					actions={ [
						{ key: 'cancel', content: 'Cancel', color: 'green', icon: 'ban' },
						{ key: 'delete', content: 'Delete', color: 'red', icon: 'trash', onClick: removeOrg }] }
				/>
			</Form.Group>

		</Form>
	);
};

OrgInputs.propTypes = {
	org: PropTypes.object
};

export default OrgInputs;
