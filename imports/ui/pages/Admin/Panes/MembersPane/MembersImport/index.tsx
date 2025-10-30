import {
	Button,
	Input,
} from "@mui/material"
import { useNavigate, useParams } from "@tanstack/react-router"
import { readCsv } from "/imports/lib/papaParseMethods"
import { sanitizeNames } from "/imports/lib/utils"

import { observer } from "mobx-react-lite"
import { MemberMethods } from "/imports/api/methods"
import { MemberSchema, MemberThemeSchema } from "/imports/api/db"

import { useSnackbar } from "notistack"
import React, { useState, useEffect, useRef } from "react"

import ImportMapping from "/imports/ui/components/ImportMapping"

const ImportMembers = observer(() => {
	const { enqueueSnackbar, closeSnackbar } = useSnackbar()

	const [pendingMembers, setPendingMembers] = useState([])
	const [pendingHeadings, setPendingHeadings] = useState([])

	const [ loading, setLoading ] = useState(false)

	const fileInputRef = useRef(null)

	const { id: themeId } = useParams()
	const history = useHistory()

	useEffect(() => {
		fileInputRef.current.click()
	}, [])

	const importMembers = e => {
		const file = e.currentTarget.files[0]

		// TODO: Display error message on error
		const parser = readCsv(file, {
			"onComplete": (data, headers) => {
				setPendingMembers(data)
				setPendingHeadings(headers)
			},
		})

		return parser
	}

	const onSanitize = data => {
		const sanitizedData = data
		sanitizedData.theme = themeId

		if(sanitizedData.hasOwnProperty("fullName") && sanitizedData.fullName.includes(",")) {
			sanitizedData.fullName = sanitizeNames(sanitizedData.fullName)
		} else if(sanitizedData.hasOwnProperty("fullName") && !sanitizedData.hasOwnProperty("firstName") && !sanitizedData.hasOwnProperty("lastName")) {
			const nameSplit = sanitizedData.fullName.split(" ")
			sanitizedData.firstName = nameSplit[0]
			sanitizedData.lastName = nameSplit[1]
		}
		return sanitizedData
	}

	// TODO: Validation error feedback
	const handleImportData = data => {
		data.forEach(datum => {
			const { error, response } = MemberMethods.upsert.call(datum)
			if(error) {
				enqueueSnackbar("Error importing members", { variant: "error" })
				console.error({ error })
			}
		})
		enqueueSnackbar(`${data.length} Member${ data.length === 1 ? "" : "s"} imported`, { variant: "success" })
		history.push(`/admin/${themeId}/members`)
	}

	const headingsMap = [
		{
			name: "firstName",
			label: "First Name",
			forms: ["firstname", "first name", "first", "f_name", "f name", "f"],
			type: String,
		},
		{
			name: "lastName",
			label: "Last Name",
			forms: ["lastName", "last name", "last", "l_name", "l name", "l"],
			type: String,
		},
		{
			name: "fullName",
			label: "Full Name",
			forms: ["name", "member", "member name", "donor"],
			type: String,
		},
		{
			name: "number",
			label: "Member Number",
			forms: ["number", "member", "member number", "membernumber", "member_number", "member #", "no", "no.", "num", "#"],
			type: val => typeof val === "string" ? parseInt(val.replace(/[^0-9.]/g, "")) : val,
		},
		{
			name: "amount",
			label: "Amount",
			forms: ["amount", "money", "donated", "donations", "given", "funds", "dollars"],
			type: val => typeof val === "string" ? parseFloat(val.replace(/[^0-9.]/g, "")) : val,
		},
		{
			name: "chits",
			label: "Chits",
			forms: ["chits", "chit", "chip", "chips", "chip vote", "chip votes", "votes", "round 1", "round one"],
			type: val => typeof val === "string" ? parseInt(val.replace(/[^0-9.]/g, "")) : val,
		},
		{
			name: "initials",
			label: "Initials",
			forms: ["initials", "initial", "init", "inits"],
			type: String,
		},
		{
			name: "phone",
			label: "Phone Number",
			forms: ["phone", "phone number", "phone no", "mobile", "mobile number", "mobile no"],
			type: String,
		},
		{
			name: "email",
			label: "Email",
			forms: ["email", "mail", "e-mail"],
			type: String,
		},
	]

	const schema = MemberSchema.omit("code")
		.extend(MemberThemeSchema.omit("member", "chitVotes", "allocations", "createdAt"))

	// TODO: Set loading=true when button clicked, false when csv is loaded
	return (
		<>
			{ pendingMembers.length > 0 && pendingHeadings.length > 0 && (
				<ImportMapping
					headings={ pendingHeadings }
					values={ pendingMembers }
					mapping={ headingsMap }
					schema = { schema }
					sanitize={ onSanitize }
					onImport={ handleImportData }
				/>
			) }

			<Button
				style={ { float: "right" } }
				onClick={ () => fileInputRef.current.click() }
				disabled={ loading }
			>
				Import List as .csv
			</Button>
			<Input
				inputRef={ fileInputRef }
				type="file"
				name="fileInput"
				accept=".csv"
				style={ { display: "none" } }
				onChange={ importMembers }
			/>
		</>
	)
})

export default ImportMembers
