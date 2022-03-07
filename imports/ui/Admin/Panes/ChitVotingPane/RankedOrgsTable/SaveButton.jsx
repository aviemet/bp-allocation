import React, { useState } from 'react'
import PropTypes from 'prop-types'
import numeral from 'numeral'
import { roundFloat } from '/imports/lib/utils'

import {
	Button,
	InputAdornment,
	TextField,
} from '@mui/material'
import ContentModal from '/imports/ui/Components/Dialogs/ContentModal'

import { ThemeMethods } from '/imports/api/methods'

const SaveButton = ({ org }) => {
	const [ amount, setAmount ]       = useState('')
	const [ modalOpen, setModalOpen ] = useState(false)

	const saveOrg = (e, el) => {
		e.preventDefault()

		let input = document.getElementById('amountInput')
		let amount = roundFloat(input.value)

		ThemeMethods.saveOrg.call({ id: org._id, amount })

		setModalOpen(false)
	}

	return (
		<>
			<Button onClick={ () => setModalOpen(true) }>Save</Button>
			<ContentModal
				title={ `Saving ${org.title}` }
				open={ modalOpen }
				setOpen={ setModalOpen }
			>
				<p>This org can be saved for {numeral(org.ask / 2).format('$0,0')}</p>
				<TextField
					id='amountInput'
					icon='dollar'
					placeholder={ `Need: ${numeral(org.ask / 2).format('$0,0')}` }
					value={ amount }
					onChange={ e => setAmount(e.target.value) }
					InputProps={ {
						startAdornment: <InputAdornment position="start">$</InputAdornment>,
					} }
				/>
				<br />
				<Button onClick={ saveOrg }>Save!</Button>
			</ContentModal>
		</>
	)
}

SaveButton.propTypes = {
	org: PropTypes.object
}

export default SaveButton
