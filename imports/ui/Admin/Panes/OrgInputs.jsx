import React from 'react';

import { Themes, Organizations } from '/imports/api';
import { OrganizationMethods } from '/imports/api/methods';

import { Button, Form, Input, Icon, Popup, Modal, Header, Image } from 'semantic-ui-react';

import FileUpload from '/imports/ui/Components/FileUpload';

// Updateable Inputs, iterable each with own state
export default class OrgInputs extends React.Component {
	// Image objects not loaded at constructor
	constructor(props) {
		super(props);

		// Initial state of bound inputs
		this.state = {
			themeId: this.props.theme,
			orgTitle: this.props.organization.title,
			orgAsk: this.props.organization.ask,

			replaceModalOpen: false,
			viewModalOpen: false
		};

		this.updateValue = this.updateValue.bind(this);
		this.handleOrgUpdate = this.handleOrgUpdate.bind(this);
		this.handleImageDropdown = this.handleImageDropdown.bind(this);
		this.removeOrg = this.removeOrg.bind(this);

		this.openReplaceModal = this.openReplaceModal.bind(this);
		this.closeReplaceModal = this.closeReplaceModal.bind(this);

		this.openViewModal = this.openViewModal.bind(this);
		this.closeViewModal = this.closeViewModal.bind(this);
	}

	// Need to wait for the Images to fetch from props
	componentDidUpdate(prevProps, prevState) {
		console.log({image: this.props.organization.image});
		if(this.props.organization.image && prevState.orgImage !== this.props.organization.image){

		}
	}

	// State updater for all inputs
	updateValue(e) {
		console.log({name: e.target.name, value: e.target.value});
		let newState = {};
		newState[e.target.name] = e.target.value;
		this.setState(newState);
		console.log(newState);
	}

	// Write to DB for all inputs
	handleOrgUpdate(e) {
		e.preventDefault();

		// Only update the document if data has changed
		if(this.state.orgTitle !== this.props.organization.title ||
			 this.state.orgAsk   !== this.props.organization.ask) {

			OrganizationMethods.update.call({id: this.props.organization._id, data: {
				title: this.state.orgTitle,
				ask: this.state.orgAsk
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
		console.log({dropdownData: data});
		switch(data.value){
			case 'view':
				this.openViewModal();
				break;
			case 'replace':
				this.openReplaceModal();
				break;
		}
	}

	openReplaceModal(){ this.setState({replaceModalOpen: true})}
	closeReplaceModal(){ this.setState({replaceModalOpen: false})}

	openViewModal(){ this.setState({viewModalOpen: true})}
	closeViewModal(){ this.setState({viewModalOpen: false})}

	removeOrg(e){
		e.preventDefault();
		console.log({removing: this.props.organization._id});
		OrganizationMethods.remove.call(this.props.organization._id, (err, res) => {
			if(err) console.log(err);
		});
	}

	render() {
		const imageOptions = [
			{ key: 'view', text: 'View', value: 'view' },
			{ key: 'replace', text: 'Replace', value: 'replace' },
		];

		return(
			<Form organization={this.props.organization._id} onSubmit={this.handleOrgUpdate} encType="multipart/form-data" onBlur={this.handleOrgUpdate}>
				<Form.Group>
					<Form.Input width={6} type='text' placeholder='Organization Name' value={this.state.orgTitle} onChange={this.updateValue} name='orgTitle' />
					<Form.Input width={2} type='text' placeholder='Ask' iconPosition='left' icon='dollar sign' value={this.state.orgAsk} onChange={this.updateValue} name='orgAsk' />
						<Form.Dropdown text='Image' floating button options={imageOptions} onChange={this.handleImageDropdown} />

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

				{/**
				 * Dropdown triggered modals
				 **/ }
				<Modal
					open={this.state.viewModalOpen}
					onClose={this.closeViewModal}>
					<Image src={this.props.organization.image.path} />
				</Modal>

				<Modal
					open={this.state.replaceModalOpen}
					onClose={this.closeReplaceModal}>

					<Header icon='browser' content='Choose New Image' />

	        <Modal.Content>
						<FileUpload width={4} name='orgImage' onEnd={this.updateImageValue} />
					</Modal.Content>

	        <Modal.Actions>
	          <Button color='green' onClick={this.closeReplaceModal}><Icon name='checkmark' />Save</Button>
	          <Button color='red' onClick={this.closeReplaceModal}><Icon name='cancel' />Cancel</Button>
	        </Modal.Actions>

				</Modal>

			</Form>
		);
	}

}

/*

this.props.organization.image._id ||
<Popup trigger={ }>
<Popup.Content>{this.props.organization.image.name || ''}</Popup.Content>
</Popup>
*/
