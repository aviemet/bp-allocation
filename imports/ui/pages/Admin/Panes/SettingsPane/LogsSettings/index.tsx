import {
	Box,
	Button,
	Chip,
	Stack,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableRow,
	TextField,
	Typography,
} from "@mui/material"
import { useParams } from "@tanstack/react-router"
import { useMemo, useState } from "react"

import { useLogs } from "/imports/api/hooks"
import { LogMethods } from "/imports/api/methods"
import {
	LogCategories,
	LogLevels,
	LogModels,
	type LogCategory,
	type LogLevel,
	type LogsFilter,
} from "/imports/api/db/Logs"
import { Loading } from "/imports/ui/components"
import { ConfirmationModal } from "/imports/ui/components/Dialogs/ConfirmDelete"

import { LogRow } from "./LogRow"

const LIMIT = 200
const NONE_MODEL = "(none)"

const categoryValues = Object.values(LogCategories)
const modelValues = Object.values(LogModels)

const toggle = <T extends string>(list: T[], value: T): T[] =>
	list.includes(value) ? list.filter(item => item !== value) : [...list, value]

const levelColor = (level: string): "default" | "info" | "warning" | "error" => {
	if(level === "error") return "error"
	if(level === "warn") return "warning"
	if(level === "info") return "info"
	return "default"
}

export const LogsSettings = () => {
	const params = useParams({ strict: false })
	const themeId = params.id

	const [selectedCategories, setSelectedCategories] = useState<LogCategory[]>([])
	const [selectedModels, setSelectedModels] = useState<string[]>([])
	const [selectedLevels, setSelectedLevels] = useState<LogLevel[]>([])
	const [search, setSearch] = useState("")
	const [purgeModalOpen, setPurgeModalOpen] = useState(false)

	const handlePurge = async () => {
		if(!themeId) return
		try {
			await LogMethods.purge.callAsync({ themeId })
		} catch (error) {
			console.error("Failed to purge logs", error)
		}
	}

	const filter = useMemo<LogsFilter | null>(() => {
		if(!themeId) return null
		const next: LogsFilter = { themeId }
		if(selectedCategories.length > 0) next.categories = selectedCategories
		if(selectedModels.length > 0) next.models = selectedModels
		if(selectedLevels.length > 0) next.levels = selectedLevels
		if(search.trim().length > 0) next.search = search.trim()
		return next
	}, [selectedCategories, selectedModels, selectedLevels, themeId, search])

	const { logs, logsLoading } = useLogs(filter, LIMIT)

	return (
		<Box>
			<Stack direction="row" spacing={ 2 } sx={ { mb: 2, alignItems: "center", flexWrap: "wrap" } }>
				<Typography variant="overline">Level</Typography>
				{ LogLevels.map(level => (
					<Chip
						key={ level }
						label={ level }
						color={ selectedLevels.includes(level) ? levelColor(level) : "default" }
						variant={ selectedLevels.includes(level) ? "filled" : "outlined" }
						size="small"
						onClick={ () => setSelectedLevels(toggle(selectedLevels, level)) }
					/>
				)) }
			</Stack>

			<Stack direction="row" spacing={ 2 } sx={ { mb: 2, alignItems: "center", flexWrap: "wrap" } }>
				<Typography variant="overline">Category</Typography>
				{ categoryValues.map(category => (
					<Chip
						key={ category }
						label={ category }
						color={ selectedCategories.includes(category) ? "primary" : "default" }
						variant={ selectedCategories.includes(category) ? "filled" : "outlined" }
						size="small"
						onClick={ () => setSelectedCategories(toggle(selectedCategories, category)) }
					/>
				)) }
			</Stack>

			<Stack direction="row" spacing={ 2 } sx={ { mb: 2, alignItems: "center", flexWrap: "wrap" } }>
				<Typography variant="overline">Model</Typography>
				{ modelValues.map(model => (
					<Chip
						key={ model }
						label={ model }
						color={ selectedModels.includes(model) ? "primary" : "default" }
						variant={ selectedModels.includes(model) ? "filled" : "outlined" }
						size="small"
						onClick={ () => setSelectedModels(toggle(selectedModels, model)) }
					/>
				)) }
				<Chip
					key={ NONE_MODEL }
					label={ NONE_MODEL }
					color={ selectedModels.includes(NONE_MODEL) ? "primary" : "default" }
					variant={ selectedModels.includes(NONE_MODEL) ? "filled" : "outlined" }
					size="small"
					onClick={ () => setSelectedModels(toggle(selectedModels, NONE_MODEL)) }
				/>
			</Stack>

			<Stack direction="row" spacing={ 2 } sx={ { mb: 2, alignItems: "center", flexWrap: "wrap" } }>
				<TextField
					size="small"
					label="Search message/action"
					value={ search }
					onChange={ event => setSearch(event.target.value) }
					sx={ { minWidth: 280 } }
				/>
				<Box sx={ { flexGrow: 1 } } />
				<Typography variant="caption" color="text.secondary">
					Showing { logs.length } { logs.length === 1 ? "entry" : "entries" } (max { LIMIT })
				</Typography>
				<Button
					size="small"
					color="error"
					variant="outlined"
					disabled={ logs.length === 0 }
					onClick={ () => setPurgeModalOpen(true) }
				>
					Purge logs
				</Button>
			</Stack>

			<ConfirmationModal
				header="Purge logs for this theme?"
				content={ `This will permanently delete all log entries for this theme. This cannot be undone.` }
				isModalOpen={ purgeModalOpen }
				handleClose={ () => setPurgeModalOpen(false) }
				confirmAction={ handlePurge }
			/>

			{ logsLoading
				? <Loading />
				: (
					<Table size="small">
						<TableHead>
							<TableRow>
								<TableCell>Time</TableCell>
								<TableCell>Level</TableCell>
								<TableCell>Category</TableCell>
								<TableCell>Model</TableCell>
								<TableCell>Action</TableCell>
								<TableCell>Message</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{ logs.map(log => <LogRow key={ log._id } log={ log } themeId={ log.themeId } />) }
							{ logs.length === 0 && (
								<TableRow>
									<TableCell colSpan={ 6 } align="center">
										<Typography variant="body2" color="text.secondary">No logs match the current filters.</Typography>
									</TableCell>
								</TableRow>
							) }
						</TableBody>
					</Table>
				) }
		</Box>
	)
}
