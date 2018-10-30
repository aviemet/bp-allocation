import React from 'react';

import { Grid, Button } from 'semantic-ui-react';
import styled from 'styled-components';

import { ThemeContext } from '/imports/ui/Contexts';

import { ThemeMethods } from '/imports/api/methods';

const ThemeConsumer = ThemeContext.Consumer;

export default class extends React.Component {
	constructor(props) {
		super(props);

		this.changeCurrentPage = this.changeCurrentPage.bind(this);
	}

	changeCurrentPage(e, data){
		ThemeMethods.update.call({id: data.theme, data: {currentPage: this.props.page}});
	}

	render() {
		return (
			<ThemeConsumer>{({_id}) => (
				<Button onClick={this.changeCurrentPage} theme={_id} icon>{this.props.children}</Button>
			)}</ThemeConsumer>
		);
	}
}
