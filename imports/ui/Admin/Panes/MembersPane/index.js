import React, { useState, useContext } from 'react';

import { MemberContext } from '/imports/context';

import { Container, Form, Input, Button } from 'semantic-ui-react';

const MembersPane = props => {

	const { members } = useContext(MemberContext);

	let [ firstName, setFirstName ] = useState('');
	let [ lastName, setLastName ] = useState('');
	let [ memberNumber, setMemberNumber ] = useState(undefined);
	let [ memberAmount, setMemberAmount ] = useState(0);

	return (
		<Container>
			<h1>Members</h1>
			<Form>
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
		</Container>
	)
}

export default MembersPane;
