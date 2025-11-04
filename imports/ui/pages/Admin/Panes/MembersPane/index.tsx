import {
	Container,
	Grid,
	Typography,
} from "@mui/material"
import { useParams, useNavigate } from "@tanstack/react-router"
import { observer } from "mobx-react-lite"


import SplitButton from "/imports/ui/components/Buttons/SplitButton"
import MembersTable from "./MembersTable"


const MembersPane = observer(() => {
	const { id } = useParams({ strict: false })
	const navigate = useNavigate()

	const options: { title: string, action: () => void }[] = [
		{
			title: "Add New Member",
			action: () => navigate({ to: "/admin/$id/members/new", params: { id: String(id) } }),
		},
		{
			title: "Import From CSV",
			action: () => navigate({ to: "/admin/$id/members/import", params: { id: String(id) } }),
		},
	]

	return (
		<Container>
			<Grid container spacing={ 4 }>
				<Grid size={ { xs: 12, md: 8 } }>
					<Typography component="h1" variant="h3">
						Members
					</Typography>
				</Grid>

				<Grid size={ { xs: 12, md: 4 } } sx={ { textAlign: "right" } }>
					<SplitButton options={ options } />
				</Grid>

				<Grid size={ { xs: 12 } }>
					<MembersTable />
				</Grid>
			</Grid>
		</Container>
	)
})

export default MembersPane
