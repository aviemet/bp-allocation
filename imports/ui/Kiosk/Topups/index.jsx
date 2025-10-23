import React, { useState, useEffect } from 'react'
import { useOrgs } from '/imports/api/providers'
import { OrganizationMethods } from '/imports/api/methods'
import { Box, Container, InputAdornment, Typography } from '@mui/material'
import { Form, TextInput, SubmitButton, STATUS, SwitchInput } from '/imports/ui/Components/Form'
import styled from '@emotion/styled'
import { isEmpty } from 'lodash'
import { OrgCard } from '/imports/ui/Components/Cards'
import TopupComplete from './TopupComplete'
import { observer } from 'mobx-react-lite'
import { useWindowSize, breakpoints } from '/imports/ui/MediaProvider'
import { Loading } from '/imports/ui/Components'
import SelectableOrgCards from './SelectableOrgCards'

const Pledges = observer(({ user }) => {
	const { topOrgs, isLoading: orgsLoading } = useOrgs()

	const [formStatus, setFormStatus] = useState(STATUS.READY)

	const [ itemsPerRow, setItemsPerRow ] = useState(2)
	const [ pledgeFeedbackData, setPledgeFeedbackData ] = useState({})

	const { width } = useWindowSize()

	useEffect(() => {
		let n = itemsPerRow
		if(width < breakpoints.tablet) n = 1
		else if(width >= breakpoints.tablet && width < breakpoints.tabletL) n = 2
		else n = 3

		if(itemsPerRow !== n) setItemsPerRow(n)
	}, [width])

	const handleSubmit = (data, { reset }) => {
		OrganizationMethods.pledge.call({
			...data,
			member: user._id,
		}, (err, res) => {
			if(err) {
				console.error(err)
			} else if(res) {
				reset()
				setPledgeFeedbackData(data)
			}
		})
	}

	if(orgsLoading) return <Loading />
	if(!isEmpty(pledgeFeedbackData)) {
		const org = topOrgs.find(org => org._id === pledgeFeedbackData.id)
		return <TopupComplete data={ { ...pledgeFeedbackData, org } } resetData={ () => setPledgeFeedbackData({}) } />
	}
	return (
		<PledgesContainer>
			<h1>If you feel like giving more</h1>
			<p>Pledges made during this round will be matched from the leverage remaining. If you feel strongly about an organization and want to help them achieve full funding, now is your chance!</p>

			<Form
				defaultValues={ {
					id: '',
					amount: '',
					anonymous: false,
				} }
				onValidSubmit={ handleSubmit }
			>
				<Container>
					<Box sx={ { textAlign: 'right', marginBottom: '0.5rem' } }>
						<SwitchInput
							toggle
							label="Anonymous"
							name="anonymous"
						/>
					</Box>
					<TextInput
						name="amount"
						placeholder='Pledge Amount'
						required
						sx={ { mb: 2 } }
						InputProps={ {
							inputProps: {
								sx: {
									padding: '0.5rem',
									textAlign: 'center',
								},
								inputMode: 'numeric',
								pattern: '[0-9.]*'
							},
							startAdornment: (
								<InputAdornment position="start" sx={ { margin: 0 } }>
									<Typography sx={ { fontFamily: 'Roboto', margin: '0 !important' } }>$</Typography>
								</InputAdornment>
							)
						} }
					/>

					<Box sx={ { mb: 2 } }>
						<SelectableOrgCards orgs={ topOrgs } />
					</Box>

					<FinalizeButton
						type="submit"
						status={ formStatus }
						setStatus={ setFormStatus }
					>
						Submit Matched Pledge
					</FinalizeButton>
				</Container>
			</Form>

		</PledgesContainer>
	)
})

const PledgesContainer = styled(Container)`
	h1 {
		text-align: center;
		font-size: 2.5rem;
		margin-bottom: 3rem;
	}
`

const FinalizeButton = styled(SubmitButton)`
	width: 100%;
	text-align: center;
	background-color: ${OrgCard.colors.GREEN};
	color: white;
	border: 2px solid #fff;
	font-size: clamp(1.75rem, -3rem + 3vw + 4.5vh, 3rem);
	text-transform: uppercase;
`

export default Pledges