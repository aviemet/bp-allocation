import React, { useState } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import numeral from 'numeral'

import { observer } from 'mobx-react-lite'
import { useTheme } from '/imports/api/providers'
import { ThemeMethods } from '/imports/api/methods'

import {
	Button,
	Chip,
	InputAdornment,
	TextField,
} from '@mui/material'
import ContentModal from '/imports/ui/Components/Dialogs/ContentModal'

const UnSaveButton = observer(({ org }) => {
	const [ modalOpen, setModalOpen ] = useState(false)

	const { theme } = useTheme()

	const unSaveOrg = () => {
		ThemeMethods.unSaveOrg.call({
			theme_id: theme._id,
			org_id: org._id
		})
		setModalOpen(false)
	}

	const save = _.find(theme.saves, ['org', org._id])

	return (
		<>
			<Chip label={ `Saved for ${numeral(save.amount).format('$0,0')}` } />
			<Button onClick={ () => setModalOpen(true) }>Un-Save</Button>
			<ContentModal
				title={ `Un-Saving ${org.title}` }
				open={ modalOpen }
				setOpen={ setModalOpen }
			>
				<p>Are you sure you want to un-save this organization?</p>
				<Button onClick={ () => setModalOpen(false) }>No</Button>
				<Button onClick={ unSaveOrg }>Yes</Button>
			</ContentModal>
		</>
	)
})

UnSaveButton.propTypes = {
	org: PropTypes.object
}

export default UnSaveButton
