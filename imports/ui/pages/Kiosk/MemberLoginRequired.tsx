import { Typography } from "@mui/material"
import { isEmpty } from "es-toolkit/compat"
import React, { useEffect, useState } from "react"

import { useFindMemberByCode } from "/imports/api/hooks"
import { Loading, MemberCodeLoginForm } from "/imports/ui/components"
import { type MemberWithTheme } from "/imports/api/db"
import { VotingSource } from "/imports/api/methods/MemberMethods"

import { KioskVotingProvider } from "./KioskVotingContext"

interface MemberLoginRequiredProps {
	component?: React.ComponentType<{ user: MemberWithTheme, source: VotingSource }> | React.ComponentType<{ user: MemberWithTheme }>
	member?: string
}

export const MemberLoginRequired = ({ member, component }: MemberLoginRequiredProps) => {
	const { findMemberByCode, findMemberById, members, membersLoading } = useFindMemberByCode()

	const [user, setUser] = useState<MemberWithTheme | false>(false)

	useEffect(() => {
		if(membersLoading || !member || user !== false) return
		const resolved = findMemberById(member)
		if(!resolved) return
		const timer = setTimeout(() => setUser(resolved), 0)
		return () => clearTimeout(timer)
	}, [membersLoading, member, user, findMemberById])

	if(membersLoading || isEmpty(members)) return <Loading />

	if(user && component) {
		const ChildComponent = component

		return (
			<KioskVotingProvider member={ user } unsetUser={ () => setUser(false) }>
				<ChildComponent user={ user } source="kiosk" />
			</KioskVotingProvider>
		)
	}

	return (
		<MemberCodeLoginForm
			header={ (
				<Typography component="h1" variant="h2" color="white" className="title" align="center">Enter Your Initials &amp; Member ID</Typography>
			) }
			submitLabel="Begin Voting!"
			findMemberByCode={ findMemberByCode }
			onMemberFound={ member => setUser(member) }
			notFoundStyle="kiosk"
		/>
	)
}
