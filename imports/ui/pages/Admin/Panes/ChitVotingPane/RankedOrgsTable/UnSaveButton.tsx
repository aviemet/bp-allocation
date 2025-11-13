import {
	Button,
	Chip,
} from "@mui/material"
import _ from "lodash"
import numeral from "numeral"
import { useState } from "react"
import { useTheme } from "/imports/api/hooks"
import { ThemeMethods } from "/imports/api/methods"

import ContentModal from "/imports/ui/components/Dialogs/ContentModal"
import { type OrgStore } from "/imports/api/stores"

interface UnSaveButtonProps {
	org: OrgStore
}

const UnSaveButton = ({ org }: UnSaveButtonProps) => {
	const [ modalOpen, setModalOpen ] = useState(false)

	const { theme } = useTheme()

	if(!theme) return null

	const unSaveOrg = async () => {
		await ThemeMethods.unSaveOrg.callAsync({
			theme_id: theme._id,
			org_id: org._id,
	}
		setModalOpen(false)
	}

	const save = _.find(theme.saves, ["org", org._id])

	if(!save) return null

	return (
		<>
			<Chip label={ `Saved for ${numeral(save.amount || 0).format("$0,0")}` } />
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
	}
	}

export default UnSaveButton
