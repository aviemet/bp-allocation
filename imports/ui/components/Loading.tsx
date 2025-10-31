import { Box, CircularProgress } from "@mui/material"
import { type FC } from "react"

const Loading: FC = () => {
	return (
		<Box sx={ { display: "flex", width: "100%", height: "100%", alignItems: "center", justifyContent: "center" } }>
			<CircularProgress />
		</Box>
	)
}

export default Loading
