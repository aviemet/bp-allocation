import { Meteor } from 'meteor/meteor';
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { withTracker } from 'meteor/react-meteor-data';

import { Themes } from '/imports/api';
import { ThemeMethods } from '/imports/api/methods';

import { Table, Icon, Segment, Input, Dropdown, Pagination } from 'semantic-ui-react';

import NewThemeModal from '/imports/ui/Welcome/NewThemeModal';

// TODO: add pagination
const ThemesList = ({ themes }) => {
	const [ page, setPage ] = useState(0);
	const [ itemsPerPage, setItemsPerPage ] = useState(10);

	const deleteTheme = id => ThemeMethods.remove.call(id);

	return (
		<React.Fragment>

			{/* <Segment><Input placeholder='Search' /></Segment> */}
			<Table celled striped
				attached='top'>
				<Table.Header>
					<Table.Row>
						<Table.HeaderCell>Title</Table.HeaderCell>
						<Table.HeaderCell collapsing><NewThemeModal /></Table.HeaderCell>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{themes.slice(page * itemsPerPage, (page + 1) * itemsPerPage).map((theme) => {
						return (
							<Table.Row key={ theme._id }>
								<Table.Cell>
									<Link to={ `/admin/${theme._id}` }>{theme.title}</Link>
								</Table.Cell>
								<Table.Cell singleLine>
									<Dropdown text='Actions' className='link item'>
										<Dropdown.Menu>
											<Dropdown.Item onClick={ () => window.open(`/kiosk/${theme._id}`) }>Launch Kiosk</Dropdown.Item>
											<Dropdown.Item onClick={ () => window.open(`/presentation/${theme._id}`) }>Launch Presentation</Dropdown.Item>
											{/* <Dropdown.Item>Live Stats</Dropdown.Item> */}
											<Dropdown.Divider />
											<Dropdown.Item onClick={ () => deleteTheme(theme._id) }><Icon name='trash' />Delete Theme</Dropdown.Item>
										</Dropdown.Menu>
									</Dropdown>
								</Table.Cell>
							</Table.Row>
						);
					})}
				</Table.Body>
			</Table>
			{ themes.length / itemsPerPage > 1 && <Pagination
				attached='bottom'
				style={ { width: '100%' } }
				activePage={ page + 1 }
				totalPages={ parseInt(themes.length / itemsPerPage) + 1 } 
				onPageChange={ (e, { activePage }) => setPage(activePage - 1) }
			/> }
		</React.Fragment>
	);
};

ThemesList.propTypes = {
	themes: PropTypes.array
};

export default withTracker(() => {
	Meteor.subscribe('themes');

	return { themes: Themes.find({}, { limit: 5, sort: { createdAt: -1 }}).fetch() };
})(ThemesList);
