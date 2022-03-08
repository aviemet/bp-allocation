import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { isEmpty } from 'lodash'

import { observer } from 'mobx-react-lite'
import { useMembers } from '/imports/api/providers'

import styled from '@emotion/styled'
import { Container, Grid, Stack, Typography } from '@mui/material'
import { Form, Input, Header, Button, Loader } from 'semantic-ui-react'

import { VotingContextProvider } from './VotingContext'

import { COLORS } from '/imports/lib/global'

const MemberLoginRequired = observer(props => {
	// Pull member data from Data Store
	const { members, isLoading: membersLoading } = useMembers()

	const formRef = React.createRef()

	const [ initials, setInitials ] = useState('')
	const [ number, setNumber ] = useState('')

	const [ searchError, setSearchError ] = useState(false)

	let member = false
	if(!membersLoading && !isEmpty(members) && !isEmpty(members.values)) {
		member = members.values.find(mem => mem._id === props.member)
	}
	const [ user, setUser ] = useState(member || false)

	if(membersLoading || isEmpty(members)) return <Loader active />

	const showSearchError = () => {
		setSearchError(true)
		setTimeout(() => {
			setSearchError(false)
		}, 5000)
	}

	const chooseMember = e => {
		e.preventDefault()

		setSearchError(false)
		const code = `${initials.trim().toUpperCase()}${number}`

		const member = members.values.find(mem => mem.code === code)

		setInitials('')
		setNumber('')
		if(member) {
			setUser(member)
		} else {
			showSearchError()
		}
	}

	const ChildComponent = props.component
	const submitDisabled = initials === '' || number === ''

	// props.member comes from router params
	// Display the interface to choose a member
	if(!user) {
		return(
			<>
				<BackgroundImage />
				<Stack justifyContent="center" alignItems="center" sx={ { minHeight: '100%' } }>
					<Form onSubmit={ chooseMember } ref={ formRef }>
						<Grid container spacing={ 2 }>

							<Grid item xs={ 12 }>
								<Typography component="h1" variant="h2" color="white" className='title' align="center">Enter Your Initials &amp; Member ID</Typography>
							</Grid>

							<Grid item xs={ 12 } md={ 6 }>
								<Form.Field>
									<Input
										fluid
										size='huge'
										label='Initials'
										placeholder='Ex: MB'
										value={ initials }
										onChange={ e => setInitials(e.target.value.trim().toUpperCase()) }
									/>
								</Form.Field>
							</Grid>

							<Grid item xs={ 12 } md={ 6 }>
								<Form.Field>
									<Input
										fluid
										size='huge'
										label='Member #'
										placeholder='Ex: 1234'
										value={ number }
										onChange={ e => setNumber(parseInt(e.target.value.trim()) || '') }
									/>
								</Form.Field>
							</Grid>

							<Grid item xs={ 12 }>
								<SubmitButton size='huge' disabled={ submitDisabled } onClick={ formRef.submit }>Begin Voting!</SubmitButton>
							</Grid>

							<Grid item xs={ 12 }>
								{ searchError && <Header as='h2' className='title'>No Member Found, Try Again</Header> }
							</Grid>

						</Grid>
					</Form>
				</Stack>
			</>
		)
	}

	// Member is chosen, display the voting panel
	return (
		<VotingContextProvider member={ user } unsetUser={ () => setUser(false) }>
			<ChildComponent user={ user } />
		</VotingContextProvider>
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

const SubmitButton = styled(Button)`
	width: 100%;
	text-align: center;
	background-color: ${COLORS.blue} !important;
	color: white !important;
	border: 2px solid #fff !important;
	font-size: 2rem !important;
	text-transform: uppercase !important;
`

MemberLoginRequired.propTypes = {
	component: PropTypes.any
}

export default MemberLoginRequired
