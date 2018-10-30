import { Meteor } from 'meteor/meteor';
import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';

import { Themes, Organizations } from '/imports/api';
import { OrganizationMethods } from '/imports/api/methods';

import { ThemeContext } from '/imports/ui/Contexts';

import { Button, Table, Header, Grid, Form, Input, Label, Loader } from 'semantic-ui-react';

import OrgInputs from '/imports/ui/Admin/Panes/OrgInputs';
import FileUpload from '/imports/ui/Components/FileUpload';

const ThemeConsumer = ThemeContext.Consumer;

class OrganizationPane extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			themeId: this.props.themeId,
			orgTitle: '',
			orgAsk: '',
			orgImage: ''
		};

		this.updateValue = this.updateValue.bind(this);
		this.handleNewOrgSubmit = this.handleNewOrgSubmit.bind(this);
		this.updateImageValue = this.updateImageValue.bind(this);
	}

	updateValue(e, data) {
		let newState = {};
		newState[data.name] = data.value;
		this.setState(newState);
	}

	updateImageValue({file}) {
		this.setState({orgImage: file._id});
	}

	handleNewOrgSubmit(e) {
		e.preventDefault();

		e.target.reset();

		OrganizationMethods.create.call({
			title: this.state.orgTitle,
			ask: this.state.orgAsk,
			image: this.state.orgImage,
			theme: this.state.themeId
		}, (err, res) => {
			if(err){
				console.log(err);
			} else {
				this.setState({orgTitle: '', orgAsk: '', orgImage: ''});
			}
		});
	}

	render() {
		if(this.props.loading){
			return(<Loader />)
		}
		return (
			<React.Fragment>
				<Grid.Row>
					<Header as="h1">Organizations for Theme</Header>
				</Grid.Row>
				<ThemeConsumer>{({_id}) => (
					this.props.organizations.map((org, i) => (
						<OrgInputs organization={org} theme={_id} key={i} />
					))
				)}</ThemeConsumer>
				<Form onSubmit={this.handleNewOrgSubmit}>
					<Form.Group>
						<Form.Input width={6} type='text' placeholder='Organization Name' name='orgTitle' onChange={this.updateValue} value={this.state.orgTitle} />
						<Form.Input width={2} type='text' placeholder='Ask' iconPosition='left' icon='dollar sign' name='orgAsk' onChange={this.updateValue} value={this.state.orgAsk} />
						<FileUpload width={4} name='orgImage' onEnd={this.updateImageValue} />
						<Form.Button width={2} type='submit'>Add</Form.Button>
					</Form.Group>
				</Form>
			</React.Fragment>
		);
	}
}

export default withTracker(({themeId}) => {
	let orgsHandle = Meteor.subscribe('organizations', themeId);

	if(orgsHandle.ready()){
		return {
			organizations: Organizations.find({theme: themeId}).fetch(),
			loading: false
		}
	}
	return { loading: true }
})(OrganizationPane);
