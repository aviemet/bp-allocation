import styled from "@emotion/styled"
import { Grid, Stack, Typography } from "@mui/material"
import { useState } from "react"

import { useFindMemberByCode } from "/imports/api/hooks"
import { COLORS } from "/imports/lib/global"
import { Loading } from "/imports/ui/components"
import { Form, TextInput, SubmitButton, STATUS, type Status } from "/imports/ui/components/Form"
import { type MemberWithTheme } from "/imports/server/transformers/memberTransformer"

interface InPersonPledgeLoginProps {
	onMemberFound: (member: MemberWithTheme) => void
}

export const InPersonPledgeLogin = ({ onMemberFound }: InPersonPledgeLoginProps) => {
	const { findMemberByCode, membersLoading } = useFindMemberByCode()
	const [formStatus, setFormStatus] = useState<Status>(STATUS.DISABLED)
	const [searchError, setSearchError] = useState(false)

	if(membersLoading) return <Loading />

	const showSearchError = () => {
		setSearchError(true)
		setTimeout(() => setSearchError(false), 5000)
	}

	const handleSubmit = (data: Record<string, unknown>) => {
		setSearchError(false)
		const member = findMemberByCode(data.initials, data.number)
		if(member) {
			onMemberFound(member)
		} else {
			showSearchError()
		}
	}

	const handleUpdate = (form: { getValues: () => Record<string, unknown> }) => {
		const data = form.getValues()
		setFormStatus(data.initials !== "" && data.number !== "" ? STATUS.READY : STATUS.DISABLED)
	}

	return (
		<>
			<BackgroundImage />
			<Stack direction="column" sx={ { justifyContent: "center", alignItems: "center", minHeight: "100%", width: "100%" } }>
				<Form
					defaultValues={ { initials: "", number: "" } }
					onValidSubmit={ handleSubmit }
					onChange={ handleUpdate }
				>
					<Grid container spacing={ 2 } sx={ { mt: 4 } }>

						<Grid size={ { xs: 12 } }>
							<Typography component="h1" variant="h3" color="white" align="center">In-Person Pledges</Typography>
							<Typography component="p" color="white" align="center" sx={ { mt: 1, mb: 2 } }>
								Pledges submitted here are matched <b>2:1</b> from the leverage pot.
							</Typography>
						</Grid>

						<Grid size={ { xs: 12 } }>
							<Typography component="h2" variant="h4" color="white" align="center">Enter Your Initials &amp; Member ID</Typography>
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
								Continue
							</StyledSubmitButton>
						</Grid>

						<Grid size={ { xs: 12 } } sx={ { textAlign: "center" } }>
							{ searchError && <Typography component="h2" variant="h5" color="error">Member Not Found</Typography> }
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
