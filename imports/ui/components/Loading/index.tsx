import { Box, CircularProgress } from "@mui/material"
import { type FC } from "react"

export const Loading: FC = () => {
	return (
		<Box sx={ { display: "flex", width: "100%", height: "100%", alignItems: "center", justifyContent: "center" } }>
			<CircularProgress />
		</Box>
	)
}
