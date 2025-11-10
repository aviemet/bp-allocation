import {
	Container,
	TableCell,
} from "@mui/material"
import { Link } from "@tanstack/react-router"
import { format } from "date-fns"
import { Meteor } from "meteor/meteor"
import { useTracker } from "meteor/react-meteor-data"
import { useState } from "react"

import { Themes } from "/imports/api/db"
import { ThemeMethods } from "/imports/api/methods"

import SortableTable, { type HeadCell } from "/imports/ui/components/SortableTable"

import ActionMenu from "/imports/ui/components/Menus/ActionMenu"
import NewThemeModal from "./NewThemeModal"
import ConfirmationModal from "/imports/ui/components/Dialogs/ConfirmDelete"

const ThemesList = () => {
	const [ modalOpen, setModalOpen ] = useState(false)
	const [ modalHeader, setModalHeader ] = useState("")
	const [ modalContent, setModalContent ] = useState("")
	const [ modalAction, setModalAction ] = useState<() => void>()

	Meteor.subscribe("themes")

	const themes = useTracker(() => {
		return Themes.find({}).fetch()
	}, [])

	const bulkDelete = (selected: string[], onSuccess: () => void) => {
		const plural = selected.length > 1

		setModalHeader(`Permanently Delete Theme${plural ? "s" : ""}?`)
		setModalContent(`This is a permanent action, theme${plural ? "s" : ""} will not be recoverable`)
		// Need to curry the function since useState calls passed functions
		setModalAction( () => async () => {
			await Promise.all(selected.map((id: string) => ThemeMethods.remove.callAsync(id)))
			onSuccess()
		})
		setModalOpen(true)
	}

	const headCells: HeadCell[] = [
		{
			id: "title",
			label: "Title",
		},
		{
			id: "createdAt",
			label: "Created Date",
			disablePadding: true,
		},
		{
			id: "actions",
			label: <NewThemeModal />,
			align: "right",
			sort: false,
			width: 150,
			disablePadding: true,
		},
	]

	return (
		<Container>
			<SortableTable
				title="Battery Powered Themes!"
				onBulkDelete={ bulkDelete }
				headCells={ headCells }
				rows={ themes }
				defaultOrderBy="createdAt"
				paginationCounts={ [5, 10, 25] }
				fixed
				render={ row => (
					<>
						<TableCell><Link to={ `/admin/${row._id}` }>{ row.title }</Link></TableCell>
						<TableCell align="center">{ format(row?.createdAt || new Date(), "MM/dd/y") }</TableCell>
						<TableCell align="right">
							<ActionMenu render={ MenuItem => [
								<MenuItem key="edit" onClick={ () => window.open(`/kiosk/${row._id}`) }>
									Kiosk
								</MenuItem>,
								<MenuItem key="duplicate" onClick={ () => window.open(`/presentation/${row._id}`) }>
									Launch Presentation
								</MenuItem>,
								<MenuItem key="archive" onClick={ () => window.open(`/pledges/${row._id}`) }>
									Launch Top-Ups
								</MenuItem>,
							] } />
						</TableCell>
					</>
				) }
			/>

			<ConfirmationModal
				isModalOpen={ modalOpen }
				handleClose={ () => setModalOpen(false) }
				header={ modalHeader }
				content={ modalContent }
				confirmAction={ modalAction }
			/>
		</Container>
	)
}

export default ThemesList
