import React from 'react'
import { useMembers } from '/imports/api/providers'
import { isEmpty } from 'lodash'

import { Container, Input, Grid, Loader } from 'semantic-ui-react'

import NewMemberInputs from './NewMemberInputs'
import MembersList from './MembersList'
import ImportMembers from './ImportMembers'
import { observer } from 'mobx-react-lite'

const MembersPane = observer(() => {
	const { members, isLoading: membersLoading } = useMembers()

	const clearSearch = () => {
		members.searchFilter = null
	}

	if(membersLoading || isEmpty(members)) return <Loader active />
	return (
		<>
			<Container style={ { marginBottom: '0.6rem' } }>
				<Grid>

					<Grid.Row>

						<Grid.Column width={ 3 }>
							<h1>Members</h1>
						</Grid.Column>

						<Grid.Column width={ 10 }>
							<Input 
								fluid 
								icon='search'
								iconPosition='left'
								action={ { icon: 'cancel', onClick: clearSearch } }
								placeholder='Filter'
								value={ members.searchFilter || '' }
								onChange={ e => members.searchFilter = e.currentTarget.value }
							/>
						</Grid.Column>

						<Grid.Column width={ 3 }>
							<ImportMembers />
						</Grid.Column>

					</Grid.Row>

				</Grid>
			</Container>

			<Container>
				<NewMemberInputs />
			</Container>

			<Container>
				<MembersList members={ members } />
			</Container>
		</>
	)
})

export default MembersPane
