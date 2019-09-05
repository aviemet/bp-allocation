import { Meteor } from 'meteor/meteor';
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { withTracker } from 'meteor/react-meteor-data';

import { Themes } from '/imports/api';
import { ThemeMethods } from '/imports/api/methods';

import { Button, Table, Icon, Segment, Input, Dropdown, Pagination } from 'semantic-ui-react';

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

				<Segment><Input placeholder='Search' /><NewThemeModal /></Segment>
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
								<Table.Row key={ theme._id }>
									<Table.Cell>
										<Link to={ `/admin/${theme._id}` }>{theme.title}</Link>
									</Table.Cell>
									<Table.Cell>{theme.quarter}</Table.Cell>
									<Table.Cell>
										<Dropdown text='Actions' className='link item'>
											<Dropdown.Menu>
												<Dropdown.Item>Launch Kiosk</Dropdown.Item>
												<Dropdown.Item>Launch Presentation</Dropdown.Item>
												<Dropdown.Item>Live Stats</Dropdown.Item>
												<Dropdown.Divider />
												<Dropdown.Item>Delete Theme</Dropdown.Item>
											</Dropdown.Menu>
										</Dropdown>
										<Button onClick={ this.deleteTheme } value={ theme._id }><Icon name='trash' /></Button>
									</Table.Cell>
								</Table.Row>
							);
						})}
					</Table.Body>
				</Table>
				<Pagination 
					defaultActivePage={ 1 }
					totalPages={ 10 } 
				/>

			</React.Fragment>
		);
	}
}

ThemesList.propTypes = {
	themes: PropTypes.array
};

export default withTracker(() => {
	Meteor.subscribe('themes');

	return { themes: Themes.find({}, { limit: 5, sort: { createdAt: -1 }}).fetch() };
})(ThemesList);
