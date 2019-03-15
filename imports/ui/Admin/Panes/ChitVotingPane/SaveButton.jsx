import React from 'react';

import { Button, Modal, Form, Input, Icon } from 'semantic-ui-react';

import { roundFloat } from '/imports/utils';

import { ThemeMethods } from '/imports/api/methods';

export default class SaveButton extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			amount: '',
			modalOpen: false
		};
	}

	handleOpen = () => this.setState({ modalOpen: true });
	handleClose = () => this.setState({modalOpen: false });

	updateAmount = (e, el) => {
		if(this.state.amount !== el.value) {
			this.setState({amount: el.value});
		}
	}

	saveOrg = (e, el) => {
		e.preventDefault();

		let input = document.getElementById('amountInput');
		let amount = roundFloat(input.value);

		ThemeMethods.saveOrg.call({id: this.props.org._id, amount});

		this.handleClose();
	}

	render() {
		return (
			<Modal
				size='tiny'
				trigger={<Button onClick={this.handleOpen} color='green' style={{float: 'right'}}>Save</Button>}
				open={this.state.modalOpen}
				onClose={this.handleClose}
			>
				<Modal.Header>Saving {this.props.org.title}</Modal.Header>
				<Modal.Content>
					<Modal.Description>
						<Form onSubmit={this.saveOrg}>
							<Form.Field>
								<Input
									id='amountInput'
									icon='dollar'
									iconPosition='left'
									placeholder={`Need: ${this.props.org.ask / 2}`}
									value={this.state.amount}
									onChange={this.updateAmount}
									action={<Button type='submit' color='green'>Save!</Button>}
								/>
							</Form.Field>
						</Form>
					</Modal.Description>
				</Modal.Content>
			</Modal>
		);
	}
}
