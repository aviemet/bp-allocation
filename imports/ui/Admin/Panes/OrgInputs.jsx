import React from 'react';

import { Themes, Organizations } from '/imports/api';
import { OrganizationMethods } from '/imports/api/methods';

import { Button, Form, Input, Icon, Popup, Modal } from 'semantic-ui-react';

import FileUpload from '/imports/ui/Components/FileUpload';

// Updateable Inputs, iterable each with own state
export default class OrgInputs extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			themeId: this.props.theme,
			orgTitle: this.props.organization.title,
			orgAsk: this.props.organization.ask,
			orgImage: this.props.organization.image
		};

		this.updateValue = this.updateValue.bind(this);
		this.handleOrgUpdate = this.handleOrgUpdate.bind(this);
		this.handleImageDropdown = this.handleImageDropdown.bind(this);
		this.removeOrg = this.removeOrg.bind(this);
	}

	updateValue(e) {
		console.log({name: e.target.name, value: e.target.value});
		let newState = {};
		newState[e.target.name] = e.target.value;
		this.setState(newState);
		console.log(newState);
	}

	handleOrgUpdate(e) {
		e.preventDefault();

		// Only update the document if data has changed
		if(this.state.orgTitle !== this.props.organization.title ||
			 this.state.orgAsk   !== this.props.organization.ask ||
			 this.state.orgImage !== this.props.organization.image) {

			OrganizationMethods.update.call({id: this.props.organization._id, data: {
				title: this.state.orgTitle,
				ask: this.state.orgAsk,
				image: this.state.orgImage
			}}, (err, res) => {
				if(err){
					console.log(err);
				} else {
					console.log('success');
				}
			});
		}

	}

	handleImageDropdown(e, data) {
		e.persist();
		console.log(data.value);
	}

	removeOrg(e){
		e.preventDefault();
		console.log({removing: this.props.organization._id});
		OrganizationMethods.remove.call(this.props.organization._id, (err, res) => {
			if(err) console.log(err);
		});
	}

	render() {
		const imageOptions = [
			{ key: 'view', text: 'View', value: this.props.organization.image },
			{ key: 'replace', text: 'Replace', value: 'replace' },
		];

		return(
			<Form organization={this.props.organization._id} onSubmit={this.handleOrgUpdate} encType="multipart/form-data" onBlur={this.handleOrgUpdate}>
				<Form.Group>
					<Form.Input width={6} type='text' placeholder='Organization Name' value={this.state.orgTitle} onChange={this.updateValue} name='orgTitle' />
					<Form.Input width={2} type='text' placeholder='Ask' iconPosition='left' icon='dollar sign' value={this.state.orgAsk} onChange={this.updateValue} name='orgAsk' />
					<Popup trigger={<Form.Dropdown text='Image' floating button options={imageOptions} onChange={this.handleImageDropdown} />}>
						<Popup.Content>{this.state.orgImage}</Popup.Content>
					</Popup>
					<Modal
						centered={false}
						trigger={<Button icon><Icon name='trash' /></Button>}
						header={`Confirm Delete`}
						content={`Are you sure you want to permanently delete the organization: ${this.props.organization.title}?`}
						actions={[
							{key: 'cancel', content: 'Cancel', color: 'green', icon: 'ban'},
							{key: 'delete', content: 'Delete', color: 'red', icon: 'trash', onClick: this.removeOrg}]}
					/>
				</Form.Group>
			</Form>
		);
	}

}
