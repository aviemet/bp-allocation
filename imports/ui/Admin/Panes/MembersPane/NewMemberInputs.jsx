import React, { useState } from 'react';

import { useMembers, useTheme } from '/imports/context';
 import { MemberMethods } from '/imports/api/methods';

import { Form, Input, Button } from 'semantic-ui-react';


const NewMemberInputs = (props) => {

	const { theme } = useTheme();
	const { members } = useMembers();

	let [ firstName, setFirstName ] = useState('');
	let [ lastName, setLastName ] = useState('');
	let [ memberNumber, setMemberNumber ] = useState(undefined);
	let [ memberAmount, setMemberAmount ] = useState(0);

	const saveMember = e => {
		e.preventDefault();

		MemberMethods.upsert.call({
			firstName,
			lastName,
			number: memberNumber,
			themeId: theme._id,
			amount: memberAmount
		}, (err, res) => {
			setFirstName('');
			setLastName('');
			setMemberNumber('');
			setMemberAmount('');
		});
	}

  return (
		<Form onSubmit={saveMember}>
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
					iconPosition='left'
					icon='hashtag'
					placeholder='Member Number'
					value={ memberNumber || '' }
					onChange={ e => setMemberNumber(e.target.value) }
				/>
				<Form.Input
					width={ 3 }
					iconPosition='left'
					icon='dollar'
					placeholder='Amount'
					value= { memberAmount || '' }
					onChange={ e => setMemberAmount(e.target.value) }
				/>
				<Button width={ 2 } type='submit'>Add Member</Button>

			</Form.Group>
		</Form>
  );
}

export default NewMemberInputs;
