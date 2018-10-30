import { Meteor } from 'meteor/meteor';
import React from 'react';
import { Link } from 'react-router-dom';
import { withTracker } from 'meteor/react-meteor-data';

import { Themes } from '/imports/api';
import { ThemeMethods } from '/imports/api/methods';

import { Button, Table, Header, Grid, Icon } from 'semantic-ui-react';

import NewThemeModal from '/imports/ui/Admin/NewThemeModal';

class ThemesList extends React.Component {

	constructor(props) {
		super(props);

		this.deleteTheme = this.deleteTheme.bind(this);
	}

	deleteTheme(e, data){
		console.log(data.value);
		ThemeMethods.remove.call(data.value)
	}

	render() {
		return (
			<React.Fragment>

				<Grid.Row>
					<Header as='h1'>Battery Powered Allocation Night</Header>
				</Grid.Row>

				<Grid.Row>
					<Grid.Column floated='left' width={13}>
						<Header as='h2'>Themes</Header>
					</Grid.Column>

					<Grid.Column floated='right' width={3}>
						<NewThemeModal />
					</Grid.Column>
				</Grid.Row>

				<Table celled striped>
					<Table.Header>
						<Table.Row>
								<Table.HeaderCell>Title</Table.HeaderCell>
								<Table.HeaderCell>Allocation Night Date</Table.HeaderCell>
								<Table.HeaderCell></Table.HeaderCell>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{this.props.themes.map((theme) => {
							return (
								<Table.Row key={theme._id}>
									<Table.Cell><Link to={`/theme/${theme._id}`}>{theme.title}</Link></Table.Cell>
									<Table.Cell>{theme.quarter}</Table.Cell>
									<Table.Cell><Button onClick={this.deleteTheme} value={theme._id}><Icon name='trash' /></Button></Table.Cell>
								</Table.Row>
							)
						})}
					</Table.Body>
				</Table>

			</React.Fragment>
		);
	}
}

export default withTracker(() => {
	themesHandle = Meteor.subscribe('themes');

	return { themes: Themes.find({}).fetch() };
})(ThemesList);
