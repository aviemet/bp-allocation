import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { readCsv } from '/imports/lib/papaParseMethods'
import { observer } from 'mobx-react-lite'
import { OrganizationMethods } from '/imports/api/methods'
import { OrganizationSchema } from '/imports/api/db/schema'
import {
	Button,
	Input,
} from '@mui/material'
import { useSnackbar } from 'notistack'
import ImportMapping from '/imports/ui/Components/ImportMapping'
import { useTheme } from '/imports/api/providers'

const ImportOrgs = observer(() => {
	const { theme } = useTheme()
	const { enqueueSnackbar, closeSnackbar } = useSnackbar()

	const [pendingOrgs, setPendingOrgs] = useState([])
	const [pendingHeadings, setPendingHeadings] = useState([])

	const [ loading, setLoading ] = useState(false)

	const fileInputRef = useRef(null)

	const navigate = useNavigate()

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
			},
		})

		return parser
	}

	const handleImportData = data => {
		data.forEach(datum => {
			const { error, response } = OrganizationMethods.create.call(Object.assign({ theme: theme._id }, datum))
			if(error) {
				enqueueSnackbar('Error importing organizations', { variant: 'error' })
				console.error({ error })
			}
		})
		enqueueSnackbar(`${data.length} Organization${ data.length === 1 ? '' : 's'} imported`, { variant: 'success' })
		navigate(`/admin/${theme._id}/orgs`)
	}

	const headingsMap = [
		{
			name: 'title',
			label: 'Title',
			forms: ['title', 'org', 'organization', 'name', 'org name', 'organization name'],
			type: String,
		},
		{
			name: 'ask',
			label: 'Ask',
			forms: ['ask', 'amount', 'request'],
			type: val => typeof val === 'string' ? parseFloat(val.replace(/[^0-9.]/g, '')) : val,
		},
		{
			name: 'description',
			label: 'Description',
			forms: ['description', 'desc', 'about', 'details', 'info', 'project overview'],
			type: String,
		},
	]

	// TODO: Set loading=true when button clicked, false when csv is loaded
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
		</>
	)
})

export default ImportOrgs
