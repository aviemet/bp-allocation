import { Meteor } from 'meteor/meteor';
import React from 'react';
import { Link } from 'react-router-dom';
import { withTracker } from 'meteor/react-meteor-data';

import moment from 'moment';

import { Themes } from '/imports/api';
import { ThemeMethods } from '/imports/api/methods';

import { Button, Table, Header, Grid, Icon } from 'semantic-ui-react';

import NewThemeModal from '/imports/ui/Welcome/NewThemeModal';

// TODO: add pagination
class ThemesList extends React.Component {

	constructor(props) {
		super(props);

		this.deleteTheme = this.deleteTheme.bind(this);
	}

	deleteTheme(e, data){
		ThemeMethods.remove.call(data.value);
	}

	render() {
		return (
			<React.Fragment>

				<Table celled striped>
					<Table.Header>
						<Table.Row>
							<Table.HeaderCell>Title</Table.HeaderCell>
							<Table.HeaderCell>Allocation Night Date</Table.HeaderCell>
							<Table.HeaderCell><NewThemeModal /></Table.HeaderCell>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{this.props.themes.map((theme) => {
							return (
								<Table.Row key={ theme._id }>
									<Table.Cell>
										<Link to={ `/themes/${theme._id}` }>{theme.title}</Link>
									</Table.Cell>
									<Table.Cell>{theme.quarter}</Table.Cell>
									<Table.Cell><Button onClick={ this.deleteTheme } value={ theme._id }><Icon name='trash' /></Button></Table.Cell>
								</Table.Row>
							);
						})}
					</Table.Body>
				</Table>

			</React.Fragment>
		);
	}
}

export default withTracker(() => {
	themesHandle = Meteor.subscribe('themes');

	return { themes: Themes.find({}, { limit: 5, sort: { createdAt: -1 }}).fetch() };
})(ThemesList);
