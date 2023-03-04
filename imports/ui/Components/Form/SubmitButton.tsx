import React, { useEffect, useState } from 'react'
import LoadingButton from '@mui/lab/LoadingButton'
import SaveIcon from '@mui/icons-material/Save'
import CheckIcon from '@mui/icons-material/Check'
import { useTimeout } from '/imports/lib/hooks'

export const STATUS = {
	READY: 'ready',
	SUBMITTING: 'submitting',
	DISABLED: 'disabled',
	SUCCESS: 'success',
	ERROR: 'error',
} as const

type TStatus = typeof STATUS[keyof typeof STATUS]

interface ISubmitButtonProps {
	children: string
	status?: TStatus
	setStatus: (status: TStatus) => void
	icon?: React.ReactNode
}

const SubmitButton = ({
	children,
	status,
	setStatus,
	icon = SaveIcon,
	...props
}: ISubmitButtonProps) => {
	const Icon = icon

	const [loading, setLoading] = useState(false)
	const [buttonIcon, setButtonIcon] = useState(icon ? <Icon /> : null)

	const { start: startStatusTimeout, clear: clearStatusTimeout } = useTimeout(() => setStatus(STATUS.READY), 4000)

	// const loadingTimeoutRef = useRef<number>()
	// const statusTimeoutRef = useRef<number>()

	useEffect(() => {
		switch (status) {
			case STATUS.READY:
				setLoading(false)
				if(icon) setButtonIcon(<Icon />)
				break
			case STATUS.SUCCESS:
				delayLoading()
				if(icon) setButtonIcon(<CheckIcon />)
				break
			case STATUS.SUBMITTING:
				setLoading(true)
				break
			case STATUS.DISABLED:
				setLoading(false)
				break
			case STATUS.ERROR:
				break
			default:
				delayLoading()
				if(icon) setButtonIcon(<Icon />)
		}
	}, [status])

	const delayLoading = () => {
		if(loading) {
			setTimeout(() => setLoading(false), 1000)
		}
	}

	useEffect(() => {
		if(status === STATUS.SUCCESS) {
			startStatusTimeout()
		}
		return () => {
			return clearStatusTimeout()
		}
	}, [loading])

	return (
		<LoadingButton
			variant="contained"
			loadingPosition={ buttonIcon ? 'end' : undefined }
			endIcon={ buttonIcon }
			loading={ loading }
			disabled={ status === STATUS.DISABLED }
			sx={ { whiteSpace: 'nowrap' } }
			color={ status === STATUS.SUCCESS ? 'success' : 'primary' }
			{ ...props }
		>{ children }</LoadingButton>
	)
}

export default SubmitButton
