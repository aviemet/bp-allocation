import { Meteor } from 'meteor/meteor';
import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import _ from 'underscore';

import { withContext } from '/imports/ui/Contexts';

import { Themes, Organizations, Images } from '/imports/api';
import { OrganizationMethods } from '/imports/api/methods';

import { ThemeContext } from '/imports/ui/Contexts';

import { Button, Table, Header, Grid, Form, Input, Label, Loader } from 'semantic-ui-react';

import OrgInputs from './OrgInputs';
import FileUpload from '/imports/ui/Components/FileUpload';

const ThemeConsumer = ThemeContext.Consumer;

class OrganizationsPane extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			orgTitle: '',
			orgAsk: '',
			orgImage: '',
			addButtonDisabled: false
		};

		this.updateValue = this.updateValue.bind(this);
		this.handleNewOrgSubmit = this.handleNewOrgSubmit.bind(this);
		this.updateImageValue = this.updateImageValue.bind(this);

		this.enableAddButton = this.enableAddButton.bind(this);
		this.disableAddButton = this.disableAddButton.bind(this);
		this.fileError = this.fileError.bind(this);
	}

	updateValue(e, data) {
		let newState = {};
		newState[data.name] = data.value;
		this.setState(newState);
	}

	updateImageValue({file}) {
		this.setState({orgImage: file._id || false});
	}

	enableAddButton()  { this.setState({addButtonDisabled: false});	}
	disableAddButton() { this.setState({addButtonDisabled: true});	}

	fileError(error, file){
		console.log({error: error, file: file});
	}

	handleNewOrgSubmit(e) {
		e.preventDefault();

		e.target.reset();

		let data = {
			title: this.state.orgTitle,
			ask: this.state.orgAsk,
			image: this.state.orgImage,
			theme: this.props.theme._id
		};
		console.log({data});

		OrganizationMethods.create.call(data, (err, res) => {
			if(err){
				console.log(err);
			} else {
				this.setState({orgTitle: '', orgAsk: '', orgImage: ''});
			}
		});
	}

	render() {
		return (
			<React.Fragment>
				<Grid.Row>
					<Header as="h1">Organizations for Theme: {this.props.theme.title}</Header>
				</Grid.Row>

				{this.props.orgs.map((org, i) => <OrgInputs org={org} key={i} /> )}

				<Form onSubmit={this.handleNewOrgSubmit}>
					<Form.Group>
						<Form.Input width={6} type='text' placeholder='Organization Name' name='orgTitle' onChange={this.updateValue} value={this.state.orgTitle} />
						<Form.Input width={2} type='text' placeholder='Ask' iconPosition='left' icon='dollar sign' name='orgAsk' onChange={this.updateValue} value={this.state.orgAsk} />
						<FileUpload width={4} name='orgImage' onEnd={this.updateImageValue} onStart={this.disableAddButton} onUploaded={this.enableAddButton} onError={this.fileError} />
						<Form.Button width={2} type='submit' disabled={this.state.addButtonDisabled}>Add</Form.Button>
					</Form.Group>
				</Form>
			</React.Fragment>
		);
	}
}

export default withContext(OrganizationsPane);
