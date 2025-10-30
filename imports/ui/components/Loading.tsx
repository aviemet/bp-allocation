import { Box, CircularProgress } from "@mui/material"
import React from "react"

const Loading: React.FC = () => {
	return (
		<Box sx={ { display: "flex", width: "100%", height: "100%", alignItems: "center", justifyContent: "center" } }>
			<CircularProgress />
		</Box>
	)
}

export default Loading
