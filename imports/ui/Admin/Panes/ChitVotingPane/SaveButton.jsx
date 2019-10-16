import React, { useState } from 'react';
import PropTypes from 'prop-types';
import numeral from 'numeral';

import { Button, Modal, Form, Input } from 'semantic-ui-react';

import { roundFloat } from '/imports/lib/utils';

import { ThemeMethods } from '/imports/api/methods';

const SaveButton = props => {

	const [ amount, setAmount ]       = useState('');
	const [ modalOpen, setModalOpen ] = useState(false);

	const saveOrg = (e, el) => {
		e.preventDefault();

		let input = document.getElementById('amountInput');
		let amount = roundFloat(input.value);

		ThemeMethods.saveOrg.call({ id: props.org._id, amount });

		setModalOpen(false);
	};

	return (
		<Modal
			size='tiny'
			open={ modalOpen }
			onClose={ () => setModalOpen(false) }
			trigger={
				<Button
					onClick={ () => setModalOpen(true) }
					color='green'
					style={ { float: 'right' } }
				>Save</Button>
			}
		>
			<Modal.Header>Saving {props.org.title}</Modal.Header>
			<Modal.Content>
				<Modal.Description>
					<p>This org can be saved for {numeral(props.org.ask / 2).format('$0,0')}</p>
					<Form onSubmit={ saveOrg }>
						<Form.Field>
							<Input
								id='amountInput'
								icon='dollar'
								iconPosition='left'
								placeholder={ `Need: ${numeral(props.org.ask / 2).format('$0,0')}` }
								value={ amount }
								onChange={ e => setAmount(e.target.value) }
								action={ <Button type='submit' color='green'>Save!</Button> }
							/>
						</Form.Field>
					</Form>
				</Modal.Description>
			</Modal.Content>
		</Modal>
	);
};

SaveButton.propTypes = {
	org: PropTypes.object
};

export default SaveButton;
