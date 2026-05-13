import styled from "@emotion/styled"
import { Grid, Stack, Typography } from "@mui/material"
import { useState, type ReactNode } from "react"

import { COLORS } from "/imports/lib/global"
import { Form, STATUS, SubmitButton, TextInput, type Status } from "/imports/ui/components"
import { type MemberWithTheme } from "/imports/api/db"

export type MemberCodeLoginFindMember = (initials: string | undefined, number: string | number | undefined) => MemberWithTheme | undefined

export interface MemberCodeLoginFormProps {
	header: ReactNode
	submitLabel: string
	findMemberByCode: MemberCodeLoginFindMember
	onMemberFound: (member: MemberWithTheme) => void
	notFoundStyle?: "kiosk" | "pledge"
}

export const MemberCodeLoginForm = ({
	header,
	submitLabel,
	findMemberByCode,
	onMemberFound,
	notFoundStyle = "pledge",
}: MemberCodeLoginFormProps) => {
	const [formStatus, setFormStatus] = useState<Status>(STATUS.DISABLED)
	const [searchError, setSearchError] = useState(false)

	const showSearchError = () => {
		setSearchError(true)
		setTimeout(() => setSearchError(false), 5000)
	}

	const handleSubmit = (data: Record<string, unknown>) => {
		setSearchError(false)
		const initialsValue = data.initials
		const numberValue = data.number
		const initials = typeof initialsValue === "string" ? initialsValue : undefined
		const memberNumber = typeof numberValue === "string" || typeof numberValue === "number" ? numberValue : undefined
		const member = findMemberByCode(initials, memberNumber)

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
							{ header }
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
								{ submitLabel }
							</StyledSubmitButton>
						</Grid>

						<Grid size={ { xs: 12 } } sx={ { textAlign: "center" } }>
							{ searchError && (
								notFoundStyle === "kiosk"
									? <Typography component="h2" variant="h2" color="white" className="title">Member Not Found</Typography>
									: <Typography component="h2" variant="h5" color="error">Member Not Found</Typography>
							) }
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
