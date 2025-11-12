import CheckIcon from "@mui/icons-material/Check"
import { CircularProgress, useTheme as useMuiTheme } from "@mui/material"
import Button from "@mui/material/Button"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { ThemeMethods } from "/imports/api/methods"
import { useTheme } from "/imports/api/providers"
import { STATUS, type Status } from "/imports/ui/components/Form"
import CustomConfirm from "/imports/ui/components/Dialogs/CustomConfirm"

const ResetMessageStatusButton = () => {
	const muiTheme = useMuiTheme()
	const { theme } = useTheme()
	const [status, setStatus] = useState<Status>(STATUS.READY)
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
	const pendingStatusTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
	const startTimeRef = useRef<number>(0)
	const [isConfirmOpen, setIsConfirmOpen] = useState(false)

	const handleOpenConfirm = useCallback(() => {
		if(!theme) return
		setIsConfirmOpen(true)
	}, [theme])

	const handleCloseConfirm = useCallback(() => {
		setIsConfirmOpen(false)
	}, [])

	const handleResetMessageStatus = useCallback(() => {
		if(pendingStatusTimeoutRef.current) {
			clearTimeout(pendingStatusTimeoutRef.current)
			pendingStatusTimeoutRef.current = null
		}
		if(!theme) return
		setIsConfirmOpen(false)
		setStatus(STATUS.SUBMITTING)
		startTimeRef.current = Date.now()
		ThemeMethods.resetMessageStatus.callAsync(theme._id)
			.then(result => {
				const succeeded = typeof result === "number" ? result > 0 : true
				const elapsed = Date.now() - startTimeRef.current
				const waitTime = Math.max(0, 2000 - elapsed)
				pendingStatusTimeoutRef.current = setTimeout(() => {
					setStatus(succeeded ? STATUS.SUCCESS : STATUS.ERROR)
					pendingStatusTimeoutRef.current = null
				}, waitTime)
			})
			.catch(() => {
				const elapsed = Date.now() - startTimeRef.current
				const waitTime = Math.max(0, 2000 - elapsed)
				pendingStatusTimeoutRef.current = setTimeout(() => {
					setStatus(STATUS.ERROR)
					pendingStatusTimeoutRef.current = null
				}, waitTime)
			})
	}, [theme])

	useEffect(() => {
		if(status === STATUS.SUCCESS) {
			const timeoutId = setTimeout(() => {
				setStatus(STATUS.READY)
			}, 2000)
			if(timeoutRef.current) {
				clearTimeout(timeoutRef.current)
			}
			timeoutRef.current = timeoutId
		} else if(status === STATUS.ERROR) {
			const timeoutId = setTimeout(() => {
				setStatus(STATUS.READY)
			}, 4000)
			if(timeoutRef.current) {
				clearTimeout(timeoutRef.current)
			}
			timeoutRef.current = timeoutId
		}
		return () => {
			if(timeoutRef.current) {
				clearTimeout(timeoutRef.current)
			}
		}
	}, [status])

	useEffect(() => {
		return () => {
			if(pendingStatusTimeoutRef.current) {
				clearTimeout(pendingStatusTimeoutRef.current)
			}
		}
	}, [])

	const backgroundColor = useMemo(() => {
		if(status === STATUS.SUBMITTING) {
			return muiTheme.palette.batteryBlue?.main || muiTheme.palette.primary.main
		}
		if(status === STATUS.SUCCESS) {
			return muiTheme.palette.batteryGreen?.main || muiTheme.palette.success.main
		}
		if(status === STATUS.ERROR) {
			return muiTheme.palette.error.main
		}
		return muiTheme.palette.warning.main
	}, [muiTheme, status])

	const buttonColor = useMemo(() => {
		if(status === STATUS.SUCCESS) return "success"
		if(status === STATUS.ERROR) return "error"
		return "warning"
	}, [status])

	const buttonIcon = useMemo(() => {
		if(status === STATUS.SUBMITTING) {
			return <CircularProgress size={ 20 } color="inherit" />
		}
		if(status === STATUS.SUCCESS) {
			return <CheckIcon />
		}
		return undefined
	}, [status])

	if(!theme) return null

	return (
		<>
			<Button
				variant="contained"
				disabled={ status === STATUS.SUBMITTING }
				color={ buttonColor }
				sx={ { backgroundColor } }
				onClick={ handleOpenConfirm }
				endIcon={ buttonIcon }
			>
				Reset Sent Status for All Messages
			</Button>
			<CustomConfirm
				header="Confirm reset"
				content="Resetting message status will permanently clear the sent state for all messages. This action cannot be undone. Do you want to continue?"
				isModalOpen={ isConfirmOpen }
				handleClose={ handleCloseConfirm }
				confirmAction={ handleResetMessageStatus }
				cancelAction={ handleCloseConfirm }
				okText="Reset message status"
				cancelText="Cancel"
				width="sm"
			/>
		</>
	)
}

export default ResetMessageStatusButton
