import React, { useState } from 'react';
import { roundFloat } from '/imports/lib/utils';

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
	const [ phone, setPhone ] = useState('');

	const saveMember = e => {
		e.preventDefault();

		MemberMethods.upsert.call({
			firstName,
			lastName,
			initials,
			number: memberNumber,
			themeId: theme._id,
			amount: memberAmount,
			phone: phone
		}, (err, res) => {
			setFirstName('');
			setLastName('');
			setInitials('');
			setMemberNumber('');
			setMemberAmount('');
			setPhone('');
		});
	};

	return (
		<Form onSubmit={ saveMember }>
			<Form.Group>
				<Form.Input
					width={ 3 }
					placeholder='First Name'
					value={ firstName }
					onChange={ e => setFirstName(e.currentTarget.value) }
				/>
				<Form.Input
					width={ 3 }
					placeholder='Last Name'
					value={ lastName }
					onChange={ e => setLastName(e.currentTarget.value) }
				/>
				<Form.Input
					width={ 2 }
					placeholder='Initials'
					value={ initials || '' }
					onChange={ e => setInitials(e.currentTarget.value) }
				/>
				<Form.Input
					width={ 3 }
					iconPosition='left'
					icon='hashtag'
					placeholder='Member Number'
					value={ memberNumber || '' }
					onChange={ e => setMemberNumber(parseInt(e.currentTarget.value)) }
				/>
				<Form.Input
					width={ 3 }
					iconPosition='left'
					icon='dollar'
					placeholder='Amount'
					value={ memberAmount || '' }
					onChange={ e => setMemberAmount(roundFloat(e.currentTarget.value)) }
				/>
				<Form.Input
					width={ 3 }
					iconPosition='left'
					icon='phone'
					placeholder='Phone Number'
					value={ phone || '' }
					onChange={ e => setPhone(e.currentTarget.value) }
				/>
				<Button width={ 2 } type='submit'>Add Member</Button>

			</Form.Group>
		</Form>
	);
});

export default NewMemberInputs;
