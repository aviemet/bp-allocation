import React, { useState } from 'react';
import { roundFloat } from '/imports/utils';

import { observer } from 'mobx-react-lite';
import { useData } from '/imports/stores/DataProvider';
import { MemberMethods } from '/imports/api/methods';

import { Form, Button } from 'semantic-ui-react';


const NewMemberInputs = observer(props => {
	const data = useData();
	const { theme } = data || {};

	const [ firstName, setFirstName ] = useState('');
	const [ lastName, setLastName ] = useState('');
	const [ initials, setInitials ] = useState('');
	const [ memberNumber, setMemberNumber ] = useState(undefined);
	const [ memberAmount, setMemberAmount ] = useState(0);

	const saveMember = e => {
		e.preventDefault();

		MemberMethods.upsert.call({
			firstName,
			lastName,
			initials,
			number: memberNumber,
			themeId: theme._id,
			amount: memberAmount
		}, (err, res) => {
			setFirstName('');
			setLastName('');
			setInitials('');
			setMemberNumber('');
			setMemberAmount('');
		});
	};

	return (
		<Form onSubmit={ saveMember }>
			<Form.Group>
				<Form.Input
					width={ 4 }
					placeholder='First Name'
					value={ firstName }
					onChange={ e => setFirstName(e.target.value) }
				/>
				<Form.Input
					width={ 4 }
					placeholder='Last Name'
					value={ lastName }
					onChange={ e => setLastName(e.target.value) }
				/>
				<Form.Input
					width={ 3 }
					placeholder='Initials'
					value={ initials || '' }
					onChange={ e => setInitials(e.target.value) }
				/>
				<Form.Input
					width={ 3 }
					iconPosition='left'
					icon='hashtag'
					placeholder='Member Number'
					value={ memberNumber || '' }
					onChange={ e => setMemberNumber(parseInt(e.target.value)) }
				/>
				<Form.Input
					width={ 3 }
					iconPosition='left'
					icon='dollar'
					placeholder='Amount'
					value= { memberAmount || '' }
					onChange={ e => setMemberAmount(roundFloat(e.target.value)) }
				/>
				<Button width={ 2 } type='submit'>Add Member</Button>

			</Form.Group>
		</Form>
	);
});

export default NewMemberInputs;
