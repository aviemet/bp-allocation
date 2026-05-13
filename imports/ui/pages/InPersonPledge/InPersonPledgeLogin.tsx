import { Typography } from "@mui/material"

import { useFindMemberByCode, useTheme } from "/imports/api/hooks"
import { Loading, MemberCodeLoginForm } from "/imports/ui/components"
import { type MemberWithTheme } from "/imports/server/transformers/memberTransformer"

interface InPersonPledgeLoginProps {
	onMemberFound: (member: MemberWithTheme) => void
}

export const InPersonPledgeLogin = ({ onMemberFound }: InPersonPledgeLoginProps) => {
	const { findMemberByCode, membersLoading } = useFindMemberByCode()
	const { theme, themeLoading } = useTheme()

	if(membersLoading || themeLoading || !theme) return <Loading />

	const ratio = theme.inPersonMatchRatio ?? 1
	const matchPerDollar = Math.max(0, ratio - 1)

	return (
		<MemberCodeLoginForm
			header={ (
				<>
					<Typography component="h1" variant="h3" color="white" align="center">In-Person Pledges</Typography>
					{ matchPerDollar > 0 && <Typography component="p" color="white" align="center" sx={ { mt: 1, mb: 2 } }>
						Pledges submitted here are matched <b>{ matchPerDollar }:1</b> from the leverage pot.
					</Typography> }
					<Typography component="h2" variant="h4" color="white" align="center">Enter Your Initials &amp; Member ID</Typography>
				</>
			) }
			submitLabel="Continue"
			findMemberByCode={ findMemberByCode }
			onMemberFound={ onMemberFound }
			notFoundStyle="pledge"
		/>
	)
}
