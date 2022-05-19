import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { isEmpty } from 'lodash'

import { observer } from 'mobx-react-lite'
import { useMembers } from '/imports/api/providers'

import styled from '@emotion/styled'
import { Loading } from '/imports/ui/Components'
import { Container, Grid, Stack, Typography } from '@mui/material'
import { Form, TextInput, SubmitButton, STATUS } from '/imports/ui/Components/Form'

import { VotingContextProvider } from './VotingContext'

import { COLORS } from '/imports/lib/global'

const MemberLoginRequired = observer(props => {
	// Pull member data from Data Store
	const { members, isLoading: membersLoading } = useMembers()

	const [formStatus, setFormStatus] = useState(STATUS.DISABLED)

	const [ searchError, setSearchError ] = useState(false)

	let member = false
	if(!membersLoading && !isEmpty(members) && !isEmpty(members.values)) {
		member = members.values.find(mem => mem._id === props.member)
	}
	const [ user, setUser ] = useState(member || false)

	if(membersLoading || isEmpty(members)) return <Loading />

	const showSearchError = () => {
		setSearchError(true)
		setTimeout(() => {
			setSearchError(false)
		}, 5000)
	}

	const chooseMember = data => {
		setSearchError(false)
		const code = `${data.initials.trim().toUpperCase()}${data.number}`

		const member = members.values.find(mem => mem.code === code)

		if(member) {
			setUser(member)
		} else {
			showSearchError()
		}
	}

	const handleUpdate = form => {
		const data = form.getValues()
		if(data.initials !== '' && data.number !== '' ) {
			setFormStatus(STATUS.READY)
		} else {
			setFormStatus(STATUS.DISABLED)
		}
	}

	const ChildComponent = props.component

	console.log({ user })

	// Member is chosen, display the voting panel
	if(user) {
		return (
			<VotingContextProvider member={ user } unsetUser={ () => setUser(false) }>
				<ChildComponent user={ user } />
			</VotingContextProvider>
		)
	}

	// props.member comes from router params
	// Display the interface to choose a member
	return(
		<>
			<BackgroundImage />
			<Stack justifyContent="center" alignItems="center" sx={ { minHeight: '100%' } }>
				<Form
					defaultValues={ { initials: '', number: '' } }
					onValidSubmit={ chooseMember }
					onChange={ handleUpdate }
				>
					<Grid container spacing={ 2 }>

						<Grid item xs={ 12 }>
							<Typography component="h1" variant="h2" color="white" className='title' align="center">Enter Your Initials &amp; Member ID</Typography>
						</Grid>

						<Grid item xs={ 12 } md={ 6 }>
							<TextInput
								name='initials'
								placeholder='Initials'
								onChange={ value => value.replace(/[0-9.]*/g, '').toUpperCase() }
							/>
						</Grid>

						<Grid item xs={ 12 } md={ 6 }>
							<TextInput
								name='number'
								placeholder='Member #'
								pattern="[0-9]+"
								onChange={ value => value.replace(/[^0-9]*/g, '') }
							/>
						</Grid>

						<Grid item xs={ 12 }>
							<StyledSubmitButton
								type="submit"
								status={ formStatus }
								setStatus={ setFormStatus }
								icon={ false }
							>
								Begin Voting!
							</StyledSubmitButton>
						</Grid>

						<Grid item xs={ 12 } textAlign='center'>
							{ searchError && <Typography component='h2' variant='h2' className='title'>Member Not Found</Typography> }
						</Grid>

					</Grid>
				</Form>
			</Stack>
		</>
	)

})

const MemberLoginContainer = styled(Container)`
	text-align: center;
	padding-top: 6rem;
	height: 100%;

	h1.title {
		color: #FFF;
		text-align: center;
		font-size: 3rem;
		text-transform: uppercase;
	}

	& h2.ui.header {
		color: #FFF;
	}

	.ui.search .ui.icon.input {
		width: 100%;
	}
`

const StyledSubmitButton = styled(SubmitButton)(({ theme }) => ({
	width: '100%',
	textAlign: 'center',
	color: 'white',
	border: '2px solid #fff',
	fontSize: '2rem',
	textTransform: 'uppercase',
	backgroundColor: COLORS.blue,

	'&.Mui-disabled': {
		backgroundColor: COLORS.blue,
	}
}))

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

MemberLoginRequired.propTypes = {
	component: PropTypes.any
}

export default MemberLoginRequired
