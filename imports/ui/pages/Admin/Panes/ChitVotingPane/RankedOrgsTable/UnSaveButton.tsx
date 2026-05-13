import {
	Button,
	Chip,
} from "@mui/material"
import { find } from "es-toolkit/compat"
import numeral from "numeral"
import { useState } from "react"
import { useTheme } from "/imports/api/hooks"
import { ThemeMethods } from "/imports/api/methods"

import { ContentModal } from "/imports/ui/components"
import { type OrgDataWithComputed } from "/imports/api/hooks"

interface UnSaveButtonProps {
	org: OrgDataWithComputed
}

export const UnSaveButton = ({ org }: UnSaveButtonProps) => {
	const [ modalOpen, setModalOpen ] = useState(false)

	const { theme } = useTheme()

	if(!theme) return null

	const unSaveOrg = async () => {
		await ThemeMethods.unSaveOrg.callAsync({
			theme_id: theme._id,
			org_id: org._id,
		})
		setModalOpen(false)
	}

	const save = find(theme.saves ?? [], ["org", org._id])

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
	)
}

