import {
	Box,
	Grid,
	Typography,
} from "@mui/material"

import PresentationSettingsForm from "./PresentationSettingsForm"
import ThemeSettingsForm from "./ThemeSettingsForm"

const GeneralSettings = () => {
	return (
		<>
			<Grid container spacing={ 2 }>
				<Grid size={ { xs: 12, md: 6 } }>
					<Box sx={ { mt: 1 } }>
						<Typography component="h2" variant="h4" sx={ { mb: 2 } }>Theme Settings</Typography>
						<ThemeSettingsForm />
					</Box>
				</Grid>
				<Grid size={ { xs: 12, md: 6 } }>
					<Box sx={ { mt: 1 } }>
						<Typography component="h2" variant="h4" sx={ { mb: 2 } }>Presentation Settings</Typography>
						<PresentationSettingsForm />
					</Box>
				</Grid>
			</Grid>
		</>
	)
}

export default GeneralSettings
