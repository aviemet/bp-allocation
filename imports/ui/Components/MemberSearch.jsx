import React, { useState } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { Search, Label } from 'semantic-ui-react';

/**
 * Member search results renderer
 * @param {object} props { title, number } of selected member 
 */
const resultRenderer = ({ title, number }) => (
	<>
		{title} <Label icon='hashtag' content={ number } />
	</>
);

/**
 * Search input for member data
 * @param {object} props Search props
 */
const MemberSearch = ({ data, value, setValue, onResultSelect, ...rest }) => {
	const [ isLoading, setIsLoading ] = useState(false);
	const [ searchResults, setSearchResults ] = useState([]);
	// const [ selectedValue, setSelectedValue ] = useState('');

	// Filter source data to only display what's needed in search results
	const source = data.map(member => {
		return ({
			title: `${member.firstName} ${member.lastName}`,
			number: member.number,
			id: member._id
		});
	});
	
	// Handle select action with user defined method
	const handleResultSelect = (e, { result }) => {
		setValue(result.title);
		if(onResultSelect) {
			onResultSelect(result);
		}
	};

	// Animate searching and filter results on user input change
	const handleSearchChange = (e, { value }) => {
		setIsLoading(true);
		setValue(value);

		// Wait for at least 2 characters to display search results
		if (value.trim().length < 1) {
			setIsLoading(false);
			setSearchResults([]);
			setValue('');
			return;
		}

		// Filter search results to match input
		const equality = new RegExp(_.escapeRegExp(value), 'i');
		setSearchResults( _.filter( source, result => equality.test(result.title) || equality.test(result.number) ) );
		setIsLoading(false);
	};

	return (
		<Search
			input={ { icon: 'search', iconPosition: 'left' } }
			loading={ isLoading }
			onResultSelect={ handleResultSelect }
			onSearchChange={ _.debounce(handleSearchChange, 1000, {
				leading: true,
			}) }
			results={ searchResults }
			resultRenderer={ resultRenderer }
			value={ value }
			fluid
			placeholder='Member Search'
			minCharacters={ 1 }
			{ ...rest }
		/>
	);
};

resultRenderer.propTypes = {
	title: PropTypes.string,
	number: PropTypes.number
};

MemberSearch.propTypes = {
	data: PropTypes.array.isRequired,
	value: PropTypes.string.isRequired,
	setValue: PropTypes.func.isRequired,
	onResultSelect: PropTypes.func,
	rest: PropTypes.any,
};

export default MemberSearch;