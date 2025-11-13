import styled from "@emotion/styled"
import { Grid, Stack, Typography } from "@mui/material"
import { isEmpty } from "lodash"
import { useMembers } from "/imports/api/hooks"
import { Loading } from "/imports/ui/components"
import { ComponentType } from "react"
import { useState } from "react"
import { Form, TextInput, SubmitButton, STATUS, type Status } from "/imports/ui/components/Form"
import { type MemberWithTheme } from "/imports/server/transformers/memberTransformer"
import { VotingSource } from "/imports/api/methods/MemberMethods"

import { FundsVoteProvider } from "./VotingContext"

import { COLORS } from "/imports/lib/global"

interface MemberLoginRequiredProps {
	component?: ComponentType<{ user: MemberWithTheme, source: VotingSource }> | ComponentType<{ user: MemberWithTheme }>
	member?: string
}

const MemberLoginRequired = (props: MemberLoginRequiredProps) => {
	// Pull member data from Data Store
	const { members, membersLoading } = useMembers()

	const [formStatus, setFormStatus] = useState<Status>(STATUS.DISABLED)

	const [ searchError, setSearchError ] = useState(false)

	let member: MemberWithTheme | undefined = undefined
	if(!membersLoading && !isEmpty(members)) {
		member = members.find(mem => mem._id === props.member)
	}
	const [user, setUser] = useState<MemberWithTheme | false>(member || false)

	if(membersLoading || isEmpty(members)) return <Loading />

	const showSearchError = () => {
		setSearchError(true)
		setTimeout(() => {
			setSearchError(false)
		}, 5000)
	}

	const chooseMember = (data: Record<string, unknown>) => {
		setSearchError(false)
		const code = `${String(data.initials || "").trim().toUpperCase()}${data.number}`

		const member = members.find(mem => mem.code === code)

		if(member) {
			setUser(member)
		} else {
			showSearchError()
		}
	}

	const handleUpdate = (form: { getValues: () => Record<string, unknown> }) => {
		const data = form.getValues()
		if(data.initials !== "" && data.number !== "" ) {
			setFormStatus(STATUS.READY)
		} else {
			setFormStatus(STATUS.DISABLED)
		}
	}

	// Member is chosen, display the voting panel
	if(user && props.component) {
		const ChildComponent = props.component
		return (
			<FundsVoteProvider member={ user } unsetUser={ () => setUser(false) }>
				<ChildComponent user={ user } source="kiosk" />
			</FundsVoteProvider>
		)
	}

	// props.member comes from router params
	// Display the interface to choose a member
	return (
		<>
			<BackgroundImage />
			<Stack flexDirection="column" justifyContent="center" alignItems="center" sx={ { minHeight: "100%" } }>
				<Form
					defaultValues={ { initials: "", number: "" } }
					onValidSubmit={ chooseMember }
					onChange={ handleUpdate }
				>
					<Grid container spacing={ 2 } sx={ { mt: 4 } }>

						<Grid size={ { xs: 12 } }>
							<Typography component="h1" variant="h2" color="white" className="title" align="center">Enter Your Initials &amp; Member ID</Typography>
						</Grid>

						<Grid size={ { xs: 12, md: 6 } }>
							<TextInput
								name="initials"
								placeholder="Initials"
								onChange={ value => value.replace(/[0-9.]*/g, "").toUpperCase() }
							/>
						</Grid>

						<Grid size={ { xs: 12, md: 6 } }>
							<TextInput
								name="number"
								placeholder="Member #"
								pattern="[0-9]+"
								onChange={ value => value.replace(/[^0-9]*/g, "") }
							/>
						</Grid>

						<Grid size={ { xs: 12 } }>
							<StyledSubmitButton
								type="submit"
								status={ formStatus }
								setStatus={ setFormStatus }
								icon={ false }
							>
								Begin Voting!
							</StyledSubmitButton>
						</Grid>

						<Grid size={ { xs: 12 } } sx={ { textAlign: "center" } }>
							{ searchError && <Typography component="h2" variant="h2" className="title">Member Not Found</Typography> }
						</Grid>

					</Grid>
				</Form>
			</Stack>
		</>
	)
}

const StyledSubmitButton = styled(SubmitButton)`
	width: 100%;
	text-align: center;
	color: #fff;
	border: 2px solid #fff;
	font-size: 2rem;
	text-transform: uppercase;
	background-color: ${COLORS.blue};

	&.Mui-disabled {
		background-color: ${COLORS.blue};
	}
`

const BackgroundImage = styled.div`
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100vh;
	opacity: 0.1;
	z-index: 0;
	background: url('/img/BPLogo.svg') no-repeat 50% 50%;
	background-size: 1600px;
`

export default MemberLoginRequired
