import React, { Component } from 'react'
import _ from 'lodash'

import { Search, Label } from 'semantic-ui-react'

const initialState = { isLoading: false, results: [], value: '' }

let source;

const resultRenderer = ({title, number}) => (
	<React.Fragment>
		{title} <Label icon='hashtag' content={number} />
	</React.Fragment>
);

export default class InputSuggest extends Component {
	constructor(props) {
		super(props);
		source = props.data.map(member => {
			return ({
				title: `${member.firstName} ${member.lastName}`,
				number: member.number
			})
		});
		console.log({source});
	}

	state = initialState;

	handleResultSelect = (e, { result }) => {
		this.setState({ value: result.title });
	}

	handleSearchChange = (e, { value }) => {
		this.setState({ isLoading: true, value })

		setTimeout(() => {
			if (this.state.value.length < 1) return this.setState(initialState)

			const re = new RegExp(_.escapeRegExp(this.state.value), 'i')
			const isMatch = result => re.test(result.title) || re.test(result.number);

			let results = _.filter(source, isMatch);
			console.log({results});

			this.setState({
				isLoading: false,
				results: _.filter(source, isMatch),
			})
		}, 300)
	}

	render() {
		const { isLoading, value, results } = this.state

		return (
			<Search
				loading={isLoading}
				onResultSelect={this.handleResultSelect}
				onSearchChange={_.debounce(this.handleSearchChange, 500, {
					leading: true,
				})}
				results={results}
				resultRenderer={resultRenderer}
				value={value}
				{...this.props}
			/>
		)
	}
}
