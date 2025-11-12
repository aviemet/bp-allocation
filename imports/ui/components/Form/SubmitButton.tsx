import CheckIcon from "@mui/icons-material/Check"
import SaveIcon from "@mui/icons-material/Save"
import { Button, type ButtonProps, useTheme } from "@mui/material"
import { useEffect, useRef, useMemo, type ReactNode, type ComponentType } from "react"

export const STATUS = {
	READY: "ready",
	SUBMITTING: "submitting",
	DISABLED: "disabled",
	SUCCESS: "success",
	ERROR: "error",
} as const

export type Status = typeof STATUS[keyof typeof STATUS]

interface SubmitButtonProps extends Omit<ButtonProps, "children"> {
	children: ReactNode
	status: Status
	setStatus: (status: Status) => void
	icon?: ComponentType | false
}

const SubmitButton = ({ children, status, setStatus, icon = SaveIcon, ...props }: SubmitButtonProps) => {
	const theme = useTheme()
	const statusTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

	const loading = status === STATUS.SUBMITTING

	const buttonIcon = useMemo(() => {
		if(icon === false) return undefined

		if(status === STATUS.SUCCESS) return <CheckIcon />

		if(!icon) return undefined

		const Icon = icon
		return <Icon />
	}, [status, icon])

	const backgroundColor = useMemo(() => {
		if(status === STATUS.READY) return theme.palette.batteryGreen?.main || theme.palette.success.main
		if(status === STATUS.SUBMITTING) return theme.palette.batteryBlue?.main || theme.palette.primary.main
		return undefined
	}, [status, theme])

	useEffect(() => {
		if(status === STATUS.SUCCESS) {
			const timeoutId = setTimeout(() => setStatus(STATUS.READY), 4000)
			if(statusTimeoutRef.current) {
				clearTimeout(statusTimeoutRef.current)
			}
			statusTimeoutRef.current = timeoutId
		}

		return () => {
			if(statusTimeoutRef.current) {
				clearTimeout(statusTimeoutRef.current)
			}
		}
	}, [status, setStatus])


	return (
		<Button
			variant="contained"
			endIcon={ buttonIcon }
			loading={ loading }
			disabled={ status === STATUS.DISABLED || status === STATUS.SUBMITTING }
			color={ status === STATUS.SUCCESS ? "success" : "primary" }
			sx={ {
				...(backgroundColor && { backgroundColor }),
				...props.sx,
			} }
			{ ...props }
		>
			{ children }
		</Button>
	)
}

export default SubmitButton
