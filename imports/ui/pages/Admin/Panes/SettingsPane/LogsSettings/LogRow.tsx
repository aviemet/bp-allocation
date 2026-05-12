import {
	Chip,
	Stack,
	TableCell,
	TableRow,
	Typography,
} from "@mui/material"
import { styled } from "@mui/material/styles"
import { Link } from "@tanstack/react-router"
import { format } from "date-fns"
import { useState } from "react"

import { type LogData } from "/imports/api/db"
import { resolveModelHref } from "./logModelLinks"

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === "object" && value !== null

const levelColor = (level: string): "default" | "info" | "warning" | "error" => {
	if(level === "error") return "error"
	if(level === "warn") return "warning"
	if(level === "info") return "info"
	return "default"
}

interface LogRowProps {
	log: LogData
	themeId: string | undefined
}

export const LogRow = ({ log, themeId }: LogRowProps) => {
	const metaRecord = isRecord(log.meta) ? log.meta : undefined
	const [metaExpanded, setMetaExpanded] = useState(false)

	return (
		<>
			<TableRow>
				<TableCell sx={ { whiteSpace: "nowrap", verticalAlign: "top" } }>
					{ log.createdAt ? format(log.createdAt, "MM/dd HH:mm:ss") : "—" }
				</TableCell>
				<TableCell sx={ { verticalAlign: "top" } }>
					<Chip
						label={ log.level }
						color={ levelColor(log.level) }
						size="small"
					/>
				</TableCell>
				<TableCell sx={ { verticalAlign: "top" } }>{ log.category }</TableCell>
				<TableCell sx={ { verticalAlign: "top" } }>
					<Stack direction="column" spacing={ 0.5 } sx={ { alignItems: "flex-start" } }>
						{ (log.model ?? []).map(modelName => {
							const href = resolveModelHref(modelName, metaRecord, themeId)
							if(href) {
								return (
									<Chip
										key={ modelName }
										label={ modelName }
										size="small"
										component={ Link }
										to={ href }
										clickable
										sx={ { "& .MuiChip-label": { textDecoration: "underline" } } }
									/>
								)
							}
							return <Chip key={ modelName } label={ modelName } size="small" variant="outlined" />
						}) }
					</Stack>
				</TableCell>
				<TableCell sx={ { verticalAlign: "top", fontFamily: "monospace", fontSize: "0.8em" } }>
					{ log.action ?? "—" }
				</TableCell>
				<TableCell sx={ { verticalAlign: "top" } }>
					<Typography variant="body2">{ log.message }</Typography>
					{ log.error && (
						<ErrorBlock>
							{ log.error.name ? `${log.error.name}: ` : "" }{ log.error.message ?? "" }
							{ log.error.code ? ` (code: ${log.error.code})` : "" }
						</ErrorBlock>
					) }
					{ metaRecord && Object.keys(metaRecord).length > 0 && (
						<MetaBlock
							expanded={ metaExpanded }
							onClick={ () => setMetaExpanded(prev => !prev) }
							title={ metaExpanded ? "Click to collapse" : "Click to expand" }
						>
							{ metaExpanded ? JSON.stringify(metaRecord, null, 2) : JSON.stringify(metaRecord) }
						</MetaBlock>
					) }
				</TableCell>
			</TableRow>
		</>
	)
}

const ErrorBlock = styled("div")(({ theme }) => ({
	marginTop: 4,
	padding: "4px 8px",
	borderLeft: `3px solid ${theme.palette.error.main}`,
	backgroundColor: theme.palette.error.light + "22",
	fontFamily: "monospace",
	fontSize: "0.75em",
	color: theme.palette.error.dark,
	whiteSpace: "pre-wrap",
}))

const MetaBlock = styled("pre", {
	shouldForwardProp: (prop) => prop !== "expanded",
})<{ expanded: boolean }>(({ theme, expanded }) => ({
	marginTop: 4,
	marginBottom: 0,
	padding: "2px 6px",
	fontFamily: "monospace",
	fontSize: "0.7em",
	color: theme.palette.text.secondary,
	cursor: "pointer",
	whiteSpace: expanded ? "pre" : "normal",
	wordBreak: expanded ? "normal" : "break-all",
	overflowX: expanded ? "auto" : "visible",
	"&:hover": {
		color: theme.palette.text.primary,
	},
}))
