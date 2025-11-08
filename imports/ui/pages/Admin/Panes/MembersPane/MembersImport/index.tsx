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
import { useState, useEffect, useRef, type ChangeEvent } from "react"
import type SimpleSchema from "simpl-schema"

import ImportMapping from "/imports/ui/components/ImportMapping"

type CsvRow = Record<string, unknown>

interface HeadingMapping {
	name: string
	label: string
	forms: string[]
	type?: (value: unknown) => unknown
}

const ImportMembers = observer(() => {
	const { enqueueSnackbar } = useSnackbar()

	const [pendingMembers, setPendingMembers] = useState<CsvRow[]>([])
	const [pendingHeadings, setPendingHeadings] = useState<string[]>([])

	const fileInputRef = useRef<HTMLInputElement>(null)

	const { id: themeId } = useParams({ from: "/admin/$id/members/import" })
	const navigate = useNavigate()

	useEffect(() => {
		fileInputRef.current?.click()
	}, [])

	const importMembers = (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.currentTarget.files?.[0]
		if(!file) return

		readCsv(file, {
			onComplete: (data, headers) => {
				setPendingMembers(data)
				setPendingHeadings(headers ?? [])
			},
		})
	}

	const onSanitize = (data: CsvRow): CsvRow => {
		const sanitizedData = { ...data }
		sanitizedData.theme = themeId

		if("fullName" in sanitizedData && typeof sanitizedData.fullName === "string" && sanitizedData.fullName.includes(",")) {
			sanitizedData.fullName = sanitizeNames(sanitizedData.fullName)
		} else if("fullName" in sanitizedData && !("firstName" in sanitizedData) && !("lastName" in sanitizedData) && typeof sanitizedData.fullName === "string") {
			const nameSplit = sanitizedData.fullName.split(" ")
			sanitizedData.firstName = nameSplit[0]
			sanitizedData.lastName = nameSplit[1]
		}
		return sanitizedData
	}

	const handleImportData = (data: CsvRow[]) => {
		data.forEach(datum => {
			MemberMethods.upsert.call(datum as unknown as Parameters<typeof MemberMethods.upsert.call>[0], (error) => {
				if(error) {
					enqueueSnackbar("Error importing members", { variant: "error" })
				}
			})
		})
		enqueueSnackbar(`${data.length} Member${data.length === 1 ? "" : "s"} imported`, { variant: "success" })
		navigate({ to: `/admin/${themeId}/members` })
	}

	const headingsMap: HeadingMapping[] = [
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
			type: (value: unknown) => typeof value === "string" ? parseInt(value.replace(/[^0-9.]/g, "")) : value,
		},
		{
			name: "amount",
			label: "Amount",
			forms: ["amount", "money", "donated", "donations", "given", "funds", "dollars"],
			type: (value: unknown) => typeof value === "string" ? parseFloat(value.replace(/[^0-9.]/g, "")) : value,
		},
		{
			name: "chits",
			label: "Chits",
			forms: ["chits", "chit", "chip", "chips", "chip vote", "chip votes", "votes", "round 1", "round one"],
			type: (value: unknown) => typeof value === "string" ? parseInt(value.replace(/[^0-9.]/g, "")) : value,
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

	return (
		<>
			{ pendingMembers.length > 0 && pendingHeadings.length > 0 && (
				<ImportMapping
					headings={ pendingHeadings }
					values={ pendingMembers }
					mapping={ headingsMap }
					schema={ schema as SimpleSchema }
					sanitize={ onSanitize }
					onImport={ handleImportData }
				/>
			) }

			<Button
				style={ { float: "right" } }
				onClick={ () => fileInputRef.current?.click() }
			>
				Import List as .csv
			</Button>
			<Input
				inputRef={ fileInputRef }
				type="file"
				name="fileInput"
				style={ { display: "none" } }
				onChange={ importMembers }
				inputProps={ { accept: ".csv" } }
			/>
		</>
	)
})

export default ImportMembers
