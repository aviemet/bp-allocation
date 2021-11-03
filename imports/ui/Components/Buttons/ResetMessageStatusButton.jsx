import React from 'react'
import { Button } from 'semantic-ui-react'
import { ThemeMethods } from '/imports/api/methods'
import { useTheme } from '/imports/api/providers'

// TODO: Needs a confirmation dialog

const ResetMessageStatusButton = () => {
	const { theme } = useTheme()

	return (
		<Button onClick={ () => ThemeMethods.resetMessageStatus.call(theme._id) }>Reset Sent Status for All Messages</Button>
	)
}

export default ResetMessageStatusButton