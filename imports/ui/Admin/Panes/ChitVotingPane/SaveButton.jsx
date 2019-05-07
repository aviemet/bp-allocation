import React, { useState } from 'react';

import { Button, Modal, Form, Input, Icon } from 'semantic-ui-react';

import { roundFloat } from '/imports/utils';

import { ThemeMethods } from '/imports/api/methods';

const SaveButton = props => {

	const [ amount, setAmount ] = useState('');
	const [ modalOpen, setModalOpen ] = useState(false);

	const saveOrg = (e, el) => {
		e.preventDefault();

		let input = document.getElementById('amountInput');
		let amount = roundFloat(input.value);

		ThemeMethods.saveOrg.call({id: props.org._id, amount});

		setModalOpen(false);
	}

	return (
		<Modal
			size='tiny'
			trigger={
				<Button
					onClick={() => setModalOpen(true)}
					color='green'
					style={{float: 'right'}}
				>Save</Button>
			}
			open={modalOpen}
			onClose={() => setModalOpen(false)}
		>
			<Modal.Header>Saving {props.org.title}</Modal.Header>
			<Modal.Content>
				<Modal.Description>
					<Form onSubmit={saveOrg}>
						<Form.Field>
							<Input
								id='amountInput'
								icon='dollar'
								iconPosition='left'
								placeholder={`Need: ${props.org.ask / 2}`}
								value={amount}
								onChange={e => setAmount(e.target.value)}
								action={<Button type='submit' color='green'>Save!</Button>}
							/>
						</Form.Field>
					</Form>
				</Modal.Description>
			</Modal.Content>
		</Modal>
	);
}

export default SaveButton;
