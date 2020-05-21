import React, { useState } from 'react'
import { roundFloat } from '/imports/lib/utils'

import { observer } from 'mobx-react-lite'
import { useTheme } from '/imports/api/providers'
import { MemberMethods } from '/imports/api/methods'

import { Form, Button } from 'semantic-ui-react'

const NewMemberInputs = observer(props => {
	const { theme } = useTheme()

	const [ firstName, setFirstName ] = useState('')
	const [ lastName, setLastName ] = useState('')
	const [ initials, setInitials ] = useState('')
	const [ memberNumber, setMemberNumber ] = useState(undefined)
	const [ memberAmount, setMemberAmount ] = useState(0)
	const [ phone, setPhone ] = useState('')

	const saveMember = e => {
		e.preventDefault()

		MemberMethods.upsert.call({
			firstName,
			lastName,
			initials,
			number: memberNumber,
			themeId: theme._id,
			amount: memberAmount,
			phone: phone
		}, (err, res) => {
			setFirstName('')
			setLastName('')
			setInitials('')
			setMemberNumber('')
			setMemberAmount('')
			setPhone('')

			if(err) console.error(err)
		})
	}

	return (
		<Form onSubmit={ saveMember }>
			<Form.Group>
				{/* First Name */}
				<Form.Input
					width={ 3 }
					placeholder='First Name'
					value={ firstName }
					onChange={ e => setFirstName(e.currentTarget.value) }
				/>
				{/* Last Name */}
				<Form.Input
					width={ 3 }
					placeholder='Last Name'
					value={ lastName }
					onChange={ e => setLastName(e.currentTarget.value) }
				/>
				{/* Initials */}
				<Form.Input
					width={ 2 }
					placeholder='Initials'
					value={ initials || '' }
					onChange={ e => setInitials(e.currentTarget.value) }
				/>
				{/* Member Number */}
				<Form.Input
					width={ 3 }
					iconPosition='left'
					icon='hashtag'
					placeholder='Member Number'
					value={ memberNumber || '' }
					onChange={ e => setMemberNumber(parseInt(e.currentTarget.value)) }
				/>
				{/* Amount */}
				<Form.Input
					width={ 3 }
					iconPosition='left'
					icon='dollar'
					placeholder='Amount'
					value={ memberAmount || '' }
					onChange={ e => setMemberAmount(roundFloat(e.currentTarget.value)) }
				/>
				{/* Phone Number */}
				<Form.Input
					width={ 3 }
					iconPosition='left'
					icon='phone'
					placeholder='Phone Number'
					value={ phone || '' }
					onChange={ e => setPhone(e.currentTarget.value) }
				/>
				<Button width={ 2 } type='submit' style={ { whiteSpace: 'nowrap' } }>+ Member</Button>

			</Form.Group>
		</Form>
	)
})

export default NewMemberInputs
