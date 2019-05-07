import React from 'react';
import _ from 'lodash';

import { OrganizationMethods, ImageMethods } from '/imports/api/methods';

import { Button, Form, Input, Icon, Popup, Modal, Header, Image, Label, Loader, Dropdown } from 'semantic-ui-react';

import FileUpload from '/imports/ui/Components/FileUpload';

class OrgInputs extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			orgTitle: props.org.title,
			orgAsk: props.org.ask,
			orgImage: props.org.image,
			replaceModalOpen: false,
			viewModalOpen: false,
		};

		this.imageReplaced = false;
	}

	// 2-way binding for inputs
	updateValue = (e) => {
		let newState = {};
		newState[e.target.name] = e.target.value;
		this.setState(newState);
	}

	updateImageValue = ({file}) => {
		this.imageReplaced = true;
		this.setState({orgImage: file._id});
	}

	// Write to DB for all inputs
	handleOrgUpdate = (e) => {
		if(e)	e.preventDefault();

		// Only update the document if data has changed
		if(this.state.orgTitle !== this.props.org.title ||
			 this.state.orgAsk   !== this.props.org.ask ||
			 this.state.orgImage !== this.props.org.image) {

			OrganizationMethods.update.call({id: this.props.org._id, data: {
				title: this.state.orgTitle,
				ask: this.state.orgAsk,
				image: this.state.orgImage
			}}, (err, res) => {
				if(err){
					console.error(err);
				} else {
					// Success
				}
			});
		}

	}

	handleImageDropdown = (e, data) => {
		e.persist();
		switch(data.value){
			case 'view':
				this.openViewModal();
				break;
			case 'replace':
				this.openReplaceModal();
				break;
		}
	}

	openReplaceModal = ()  => { this.setState({replaceModalOpen: true});  }
	closeReplaceModal = () => { this.setState({replaceModalOpen: false}); }

	openViewModal = ()  => { this.setState({viewModalOpen: true});  }
	closeViewModal = () => { this.setState({viewModalOpen: false}); }

	cancelReplaceModal = () => {
		if(this.imageReplaced){
			ImageMethods.remove.call(this.state.orgImage);
		}
		this.imageReplaced = false;
		this.setState({orgImage: this.props.org.image._id});
		this.closeReplaceModal();
	}

	saveReplaceModal = () => {
		this.handleOrgUpdate();
		this.closeReplaceModal();
	}

	removeOrg = (e) => {
		e.preventDefault();
		OrganizationMethods.remove.call(this.props.org._id, (err, res) => {
			if(err) console.error(err);
		});
	}

	render() {
		const imageOptions = [
			{ key: 'view', text: 'View', value: 'view' },
			{ key: 'replace', text: 'Replace', value: 'replace' },
		];

		let org = this.props.org;
		let image = this.props.image;

		return(
			<Form organization={org._id} onSubmit={this.handleOrgUpdate} encType="multipart/form-data" onBlur={this.handleOrgUpdate}>
				<Form.Group>
					<Form.Input width={6} type='text' placeholder='Organization Name' value={this.state.orgTitle} onChange={this.updateValue} name='orgTitle' />

					<Form.Input width={2} type='text' placeholder='Ask' iconPosition='left' icon='dollar sign' value={this.state.orgAsk} onChange={this.updateValue} name='orgAsk' />

					<Form.Dropdown width={2} text='Image' simple fluid button options={imageOptions} onChange={this.handleImageDropdown} />

					<Form.Field width={5}>
						<Label style={{width: '100%', height: '100%'}}>{image && image.name ? image.name : ''}</Label>
					</Form.Field>

					<Modal
						centered={false}
						trigger={<Button icon><Icon name='trash' /></Button>}
						header={`Confirm Delete`}
						content={`Are you sure you want to permanently delete the organization: ${org.title}?`}
						actions={[
							{key: 'cancel', content: 'Cancel', color: 'green', icon: 'ban'},
							{key: 'delete', content: 'Delete', color: 'red', icon: 'trash', onClick: this.removeOrg}]}
					/>
				</Form.Group>

				{/**
				 * Dropdown triggered modals
				 **/ }

				{/* View Image */}
				<Modal
					open={this.state.viewModalOpen}
					onClose={this.closeViewModal}>
					<Image src={image && image.path ? image.path : '/img/default.jpg'} />
				</Modal>

				{/* Replace Image */}
				<Modal
					open={this.state.replaceModalOpen}
					onClose={this.closeReplaceModal}>

					<Header icon='browser' content='Choose New Image' />

	        <Modal.Content>
						<FileUpload
							width={4}
							name='orgImage'
							onEnd={this.updateImageValue}
						/>
					</Modal.Content>

	        <Modal.Actions>
	          <Button color='green' onClick={this.saveReplaceModal} value='cancel'><Icon name='checkmark' />Save</Button>
	          <Button color='red' onClick={this.cancelReplaceModal}><Icon name='cancel' />Cancel</Button>
	        </Modal.Actions>

				</Modal>

			</Form>
		);
	}

}

export default OrgInputs;
