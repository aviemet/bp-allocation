import {
	Button,
	InputAdornment,
	TextField,
} from "@mui/material"
import numeral from "numeral"
import { useState } from "react"
import { roundFloat } from "/imports/lib/utils"

import ContentModal from "/imports/ui/components/Dialogs/ContentModal"

import { ThemeMethods } from "/imports/api/methods"
import { type OrgStore } from "/imports/api/stores"

interface SaveButtonProps {
	org: OrgStore
}

const SaveButton = ({ org }: SaveButtonProps) => {
	const [ amount, setAmount ] = useState("")
	const [ modalOpen, setModalOpen ] = useState(false)

	const saveOrg = async (e, el) => {
		e.preventDefault()

		let input = document.getElementById("amountInput")
		let amount = roundFloat(input.value)

		await ThemeMethods.saveOrg.callAsync({ id: org._id, amount })

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
				<p>This org can be saved for { numeral(org.ask / 2).format("$0,0") }</p>
				<TextField
					id="amountInput"
					icon="dollar"
					placeholder={ `Need: ${numeral(org.ask / 2).format("$0,0")}` }
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

export default SaveButton
