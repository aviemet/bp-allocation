import React, { useEffect, useState, useRef } from 'react'
import PropTypes from 'prop-types'
import LoadingButton from '@mui/lab/LoadingButton'
import SaveIcon from '@mui/icons-material/Save'
import CheckIcon from '@mui/icons-material/Check'

export const STATUS = {
	READY: 'ready',
	SUBMITTING: 'submitting',
	DISABLED: 'disabled',
	SUCCESS: 'success',
	ERROR: 'error',
}

const SubmitButton = ({ children, status, setStatus, icon = SaveIcon, ...props }) => {
	const Icon = icon

	const [loading, setLoading] = useState(false)
	const [buttonIcon, setButtonIcon] = useState(icon ? <Icon /> : null)

	const loadingTimeoutRef = useRef()
	const statusTimeoutRef = useRef()

	useEffect(() => {
		switch(status) {
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
			statusTimeoutRef.current = setTimeout(() => setStatus(STATUS.READY), 4000)
		}

		return () => {
			if(typeof statusTimeoutRef.current === 'function') statusTimeoutRef.current.clearTimeout()
		}
	}, [loading])

	useEffect(() => {
		return () => {
			if(typeof loadingTimeoutRef.current === 'function') loadingTimeoutRef.current.clearTimeout()
		}
	}, [])

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

// TODO: Figure out the correct proptype for icon
SubmitButton.propTypes = {
	children: PropTypes.string.isRequired,
	status: PropTypes.oneOf(Object.values(STATUS)).isRequired,
	setStatus: PropTypes.func.isRequired,
	icon: PropTypes.any
}

export default SubmitButton
