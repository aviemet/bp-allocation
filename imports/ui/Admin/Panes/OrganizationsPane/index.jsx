import { Meteor } from 'meteor/meteor';
import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import _ from 'lodash';

import { ThemeContext, withContext } from '/imports/api/Context';

import { OrganizationMethods } from '/imports/api/methods';

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
	}

	// 2-way binding for inputs, fires on onChange event
	updateValue = (e, data) => {
		let newState = {};
		newState[data.name] = data.value;
		this.setState(newState);
	}

	// Populates state with uploaded image data to be saved in db
	updateImageValue = ({file}) => {
		this.setState({orgImage: file._id || false});
		// console.log({orgImage: this.state.orgImage});
	}

	enableAddButton = () =>  { this.setState({addButtonDisabled: false});	}
	disableAddButton = () => { this.setState({addButtonDisabled: true});	}

	fileError = (error, file) => {
		console.error({error: error, file: file});
	}

	handleNewOrgSubmit = (e) => {
		e.preventDefault();

		e.target.reset();

		let data = {
			title: this.state.orgTitle,
			ask: this.state.orgAsk,
			image: this.state.orgImage,
			theme: this.props.theme._id
		};

		OrganizationMethods.create.call(data, (err, res) => {
			if(err){
				console.error(err);
			} else {
				this.setState({orgTitle: '', orgAsk: '', orgImage: ''});
			}
		});
	}

	render() {
		let title = this.props.loading ? '' : this.props.theme.title;

		return (
			<React.Fragment>
				<Grid.Row>
					<Header as="h1">Organizations for Theme: {title}</Header>
				</Grid.Row>

				<Form onSubmit={this.handleNewOrgSubmit}>
					<Form.Group>
						<Form.Input
							width={6}
							type='text'
							placeholder='Organization Name'
							name='orgTitle'
							onChange={this.updateValue}
							value={this.state.orgTitle}
						/>

						<Form.Input
							width={2}
							type='text'
							placeholder='Ask'
							iconPosition='left'
							icon='dollar sign'
							name='orgAsk'
							onChange={this.updateValue}
							value={this.state.orgAsk}
						/>

						<FileUpload
							name='orgImage'
							width={4}
							onEnd={this.updateImageValue}
							onStart={this.disableAddButton}
							onUploaded={this.enableAddButton}
							onError={this.fileError}
						/>

						<Form.Button width={2} type='submit' disabled={this.state.addButtonDisabled}>Add</Form.Button>
					</Form.Group>
				</Form>

				{!_.isEmpty(this.props.orgs) && this.props.orgs.map((org, i) => <OrgInputs org={org} image={_.find(this.props.images, {'_id': org.image})} key={i} /> )}

			</React.Fragment>
		);
	}
}

export default withContext(OrganizationsPane);
