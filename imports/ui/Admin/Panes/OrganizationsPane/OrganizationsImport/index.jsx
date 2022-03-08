import React, { useState, useEffect, useRef } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { readCsv } from '/imports/lib/papaParseMethods'

import { observer } from 'mobx-react-lite'
import { useData } from '/imports/api/providers'
import { OrganizationMethods } from '/imports/api/methods'
import { OrganizationSchema } from '/imports/api/db/schema'

import CustomMessage from '/imports/ui/Components/CustomMessage'
import {
	Button,
	Input,
} from '@mui/material'

import ImportMapping from '/imports/ui/Components/ImportMapping'

const ImportOrgs = observer(() => {
	const [pendingOrgs, setPendingOrgs] = useState([])
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

	const importOrgs = e => {
		const file = e.currentTarget.files[0]

		// TODO: Display error message on error
		const parser = readCsv(file, {
			'onComplete': (data, headers) => {
				setPendingOrgs(data)
				setPendingHeadings(headers)
			}
		})

		return parser
	}

	const handleImportData = data => {
		data.forEach(datum => {
			const { error, response } = OrganizationMethods.create.call(Object.assign({ theme: themeId }, datum))
			if(error) console.error({ error })
		})
		history.push(`/admin/${themeId}/orgs`)
	}

	const headingsMap = [
		{
			name: 'title',
			label: 'Title',
			forms: ['title', 'org', 'organization', 'name', 'org name', 'organization name'],
			type: String
		},
		{
			name: 'ask',
			label: 'Ask',
			forms: ['ask', 'amount', 'request'],
			type: val => typeof val === 'string' ? parseFloat(val.replace(/[^0-9.]/g, '')) : val
		},
		{
			name: 'description',
			label: 'Description',
			forms: ['description', 'desc', 'about', 'details', 'info', 'project overview'],
			type: String
		}
	]

	return (
		<>
			{ pendingOrgs.length > 0 && pendingHeadings.length > 0 && (
				<ImportMapping
					headings={ pendingHeadings }
					values={ pendingOrgs }
					mapping={ headingsMap }
					schema={ OrganizationSchema.omit('theme') }
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
				onChange={ importOrgs }
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

export default ImportOrgs
