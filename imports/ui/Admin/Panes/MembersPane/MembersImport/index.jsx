import React, { useState, useEffect, useRef } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { readCsv } from '/imports/lib/papaParseMethods'
import { sanitizeNames } from '/imports/lib/utils'

import { observer } from 'mobx-react-lite'
import { useData } from '/imports/api/providers'
import { OrganizationMethods } from '/imports/api/methods'
import { MemberSchema, MemberThemeSchema } from '/imports/api/db/schema'

import CustomMessage from '/imports/ui/Components/CustomMessage'
import {
	Button,
	Input,
} from '@mui/material'

import ImportMapping from '/imports/ui/Components/ImportMapping'

const ImportMembers = observer(() => {
	const [pendingMembers, setPendingMembers] = useState([])
	const [pendingHeadings, setPendingHeadings] = useState([])

	const [ importResponseMessageVisible, setImportResponseMessageVisible ] = useState(false)
	const [ importReponseMessage, setImportResponseMessage ] = useState('')
	const [ loading, setLoading ] = useState(false)

	const fileInputRef = useRef(null)

	const { id: themeId } = useParams()
	const history = useHistory()

	const hideImportResponseMessage = () => setImportResponseMessageVisible(false)

	useEffect(() => {
		fileInputRef.current.click()
	}, [])

	const importMembers = e => {
		const file = e.currentTarget.files[0]

		// TODO: Display error message on error
		const parser = readCsv(file, {
			'onComplete': (data, headers) => {
				setPendingMembers(data)
				setPendingHeadings(headers)
			}
		})

		return parser
	}

	// TODO: Validation error feedback
	const handleImportData = data => {
		data.forEach(datum => {
			const sanitizedData = datum

			if(sanitizedData.hasOwnProperty('fullName') && sanitizedData.fullName.includes(',')) {
				sanitizedData.fullName = sanitizeNames(sanitizedData.fullName)
			}
			const { error, response } = OrganizationMethods.create.call(Object.assign({ theme: themeId }, datum))
			if(error) console.error({ error })
		})
		history.push(`/admin/${themeId}/members`)
	}

	const headingsMap = [
		{
			name: 'firstName',
			label: 'First Name',
			forms: ['firstname', 'first name', 'first', 'f_name', 'f name', 'f'],
			type: String
		},
		{
			name: 'lastName',
			label: 'Last Name',
			forms: ['lastName', 'last name', 'last', 'l_name', 'l name', 'l'],
			type: String
		},
		{
			name: 'fullName',
			label: 'Full Name',
			forms: ['name', 'member', 'member name', 'donor'],
			type: String
		},
		{
			name: 'number',
			label: 'Member Number',
			forms: ['number', 'member', 'member number', 'membernumber', 'member_number', 'member #', 'no', 'no.', 'num', '#'],
			type: val => typeof val === 'string' ? parseInt(val.replace(/[^0-9.]/g, '')) : val
		},
		{
			name: 'amount',
			label: 'Amount',
			forms: ['amount', 'money', 'donated', 'donations', 'given', 'funds', 'dollars'],
			type: val => typeof val === 'string' ? parseFloat(val.replace(/[^0-9.]/g, '')) : val
		},
		{
			name: 'chits',
			label: 'Chits',
			forms: ['chits', 'chit', 'chip', 'chips', 'chip vote', 'chip votes', 'votes', 'round 1', 'round one'],
			type: val => typeof val === 'string' ? parseInt(val.replace(/[^0-9.]/g, '')) : val
		},
		{
			name: 'initials',
			label: 'Initials',
			forms: ['initials', 'initial', 'init', 'inits'],
			type: String
		},
		{
			name: 'phone',
			label: 'Phone Number',
			forms: ['phone', 'phone number', 'phone no', 'mobile', 'mobile number', 'mobile no'],
			type: String
		},
		{
			name: 'email',
			label: 'Email',
			forms: ['email', 'mail', 'e-mail'],
			type: String
		}
	]

	const schema = MemberSchema.omit('code')
		.extend(MemberThemeSchema.omit('member', 'chitVotes', 'allocations', 'createdAt'))

	return (
		<>
			{ pendingMembers.length > 0 && pendingHeadings.length > 0 && (
				<ImportMapping
					headings={ pendingHeadings }
					values={ pendingMembers }
					mapping={ headingsMap }
					schema = { schema }
					onImport={ handleImportData }
				/>
			) }

			<Button
				style={ { float: 'right' } }
				onClick={ () => fileInputRef.current.click() }
				disabled={ loading }
			>
				Import List as .csv
			</Button>
			<Input
				inputRef={ fileInputRef }
				type='file'
				name='fileInput'
				accept='.csv'
				style={ { display: 'none' } }
				onChange={ importMembers }
			/>
			{ importResponseMessageVisible && <CustomMessage
				positive
				onDismiss={ hideImportResponseMessage }
				heading='Import Successful'
				body={ importReponseMessage }
			/> }
		</>
	)
})

export default ImportMembers
