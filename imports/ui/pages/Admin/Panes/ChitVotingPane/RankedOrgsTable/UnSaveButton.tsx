import {
	Button,
	Chip,
	InputAdornment,
	TextField,
} from "@mui/material"
import _ from "lodash"
import { observer } from "mobx-react-lite"
import numeral from "numeral"
import { useState } from "react"
import { useTheme } from "/imports/api/providers"
import { ThemeMethods } from "/imports/api/methods"

import ContentModal from "/imports/ui/components/Dialogs/ContentModal"
import { type OrgStore } from "/imports/api/stores"

interface UnSaveButtonProps {
	org: OrgStore
}

const UnSaveButton = observer(({ org }: UnSaveButtonProps) => {
	const [ modalOpen, setModalOpen ] = useState(false)

	const { theme } = useTheme()

	const unSaveOrg = () => {
		ThemeMethods.unSaveOrg.call({
			theme_id: theme._id,
			org_id: org._id,
		})
		setModalOpen(false)
	}

	const save = _.find(theme.saves, ["org", org._id])

	return (
		<>
			<Chip label={ `Saved for ${numeral(save.amount).format("$0,0")}` } />
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

export default UnSaveButton
