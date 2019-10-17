import React, { useState } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { Search, Label } from 'semantic-ui-react';

const resultRenderer = ({ title, number }) => (
	<React.Fragment>
		{title} <Label icon='hashtag' content={ number } />
	</React.Fragment>
);

const MemberSearch = props => {
	const [ isLoading, setIsLoading ] = useState(false);
	const [ searchResults, setSearchResults ] = useState([]);
	const [ selectedValue, setSelectedValue ] = useState('');

	const source = props.data.map(member => {
		return ({
			title: `${member.firstName} ${member.lastName}`,
			number: member.number,
			id: member._id
		});
	});

	const handleResultSelect = (e, { result }) => {
		setSelectedValue(result.title);
		if(props.callback) {
			props.callback(Object.assign({ pledge: props.pledgeId }, result));
		}
	};

	const handleSearchChange = (e, { value }) => {
		setIsLoading(true);
		setSelectedValue(value);

		if (value.length < 1) {
			setIsLoading(false);
			setSearchResults([]);
			setSelectedValue('');
			return;
		}

		const re = new RegExp(_.escapeRegExp(value), 'i');
		const isMatch = result => re.test(result.title) || re.test(result.number);

		setSearchResults(_.filter(source, isMatch));
		setIsLoading(false);
	};

	return (
		<Search
			loading={ isLoading }
			onResultSelect={ handleResultSelect }
			onSearchChange={ _.debounce(handleSearchChange, 500, {
				leading: true,
			}) }
			results={ searchResults }
			resultRenderer={ resultRenderer }
			value={ selectedValue }
			fluid
			size={ props.size }
		/>
	);
};

resultRenderer.propTypes = {
	title: PropTypes.string,
	number: PropTypes.number
};

MemberSearch.propTypes = {
	data: PropTypes.array,
	callback: PropTypes.func,
	size: PropTypes.number,
	pledgeId: PropTypes.string
};

export default MemberSearch;