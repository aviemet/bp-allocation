import {
	Button,
	Input,
} from "@mui/material"
import { useNavigate, useParams } from "@tanstack/react-router"
import { useSnackbar } from "notistack"
import { readCsv } from "/imports/lib/papaParseMethods"
import { OrganizationMethods } from "/imports/api/methods"
import { OrganizationSchema } from "/imports/api/db"
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

const ImportOrgs = () => {
	const { enqueueSnackbar } = useSnackbar()

	const [pendingOrgs, setPendingOrgs] = useState<CsvRow[]>([])
	const [pendingHeadings, setPendingHeadings] = useState<string[]>([])

	const fileInputRef = useRef<HTMLInputElement>(null)

	const { id: themeId } = useParams({ strict: false })
	const navigate = useNavigate()

	useEffect(() => {
		fileInputRef.current?.click()
	}, [])

	const importOrgs = (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.currentTarget.files?.[0]
		if(!file) return

		readCsv(file, {
			onComplete: (data, headers) => {
				setPendingOrgs(data)
				setPendingHeadings(headers ?? [])
			},
		})
	}

	const handleImportData = async (data: CsvRow[]) => {
		const promises = data.map(datum =>
			OrganizationMethods.create.callAsync({ theme: themeId, ...datum })
				.catch(error => {
					enqueueSnackbar("Error importing organizations", { variant: "error" })
					console.error(error)
				})
		)
		await Promise.all(promises)
		enqueueSnackbar(`${data.length} Organization${data.length === 1 ? "" : "s"} imported`, { variant: "success" })
		navigate({ to: `/admin/${themeId}/orgs` })
	}

	const headingsMap: HeadingMapping[] = [
		{
			name: "title",
			label: "Title",
			forms: ["title", "org", "organization", "name", "org name", "organization name"],
			type: String,
		},
		{
			name: "ask",
			label: "Ask",
			forms: ["ask", "amount", "request"],
			type: (value: unknown) => typeof value === "string" ? parseFloat(value.replace(/[^0-9.]/g, "")) : value,
		},
		{
			name: "description",
			label: "Description",
			forms: ["description", "desc", "about", "details", "info", "project overview"],
			type: String,
		},
	]

	return (
		<>
			{ pendingOrgs.length > 0 && pendingHeadings.length > 0 && (
				<ImportMapping
					headings={ pendingHeadings }
					values={ pendingOrgs }
					mapping={ headingsMap }
					schema={ OrganizationSchema.omit("theme") as SimpleSchema }
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
				onChange={ importOrgs }
				inputProps={ { accept: ".csv" } }
			/>
		</>
	)
}

export default ImportOrgs
