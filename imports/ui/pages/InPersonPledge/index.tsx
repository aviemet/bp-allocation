import { Stack, Typography } from "@mui/material"
import { useState } from "react"

import { useSettings, useTheme } from "/imports/api/hooks"
import { Loading } from "/imports/ui/components"
import { type MemberWithTheme } from "/imports/server/transformers/memberTransformer"

import { InPersonPledgeForm } from "./InPersonPledgeForm"
import { InPersonPledgeLogin } from "./InPersonPledgeLogin"

const Message = ({ heading, body }: { heading: string, body: string }) => (
	<Stack direction="column" sx={ { justifyContent: "center", alignItems: "center", minHeight: "100%", color: "white", textAlign: "center", px: 2 } }>
		<Typography component="h1" variant="h3" gutterBottom>{ heading }</Typography>
		<Typography variant="body1">{ body }</Typography>
	</Stack>
)

export const InPersonPledge = () => {
	const { theme, themeLoading } = useTheme()
	const { settings, settingsLoading } = useSettings()
	const [user, setUser] = useState<MemberWithTheme | null>(null)

	if(themeLoading || settingsLoading || !theme) return <Loading />

	if(!theme.inPersonPledgeActive) {
		return <Message
			heading="In-person pledges are not enabled"
			body="This presentation does not support the in-person pledge flow."
		/>
	}

	if(!settings?.topupsActive) {
		return <Message
			heading="Pledges are not currently active"
			body="Please check with the event organizer."
		/>
	}

	if(!user) {
		return <InPersonPledgeLogin onMemberFound={ setUser } />
	}

	return <InPersonPledgeForm user={ user } onSignOut={ () => setUser(null) } />
}
