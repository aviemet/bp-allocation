import React from 'react';
import { useData, useMembers } from '/imports/api/providers';

import { Container, Input, Grid } from 'semantic-ui-react';

import NewMemberInputs from './NewMemberInputs';
import MembersList from './MembersList';
import ImportMembers from './ImportMembers';
import { observer } from 'mobx-react-lite';

const MembersPane = observer(() => {
	const data = useData();
	const { members } = useMembers();

	const clearSearch = () => {
		members.searchFilter = null;
	};

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
								value={ data.memberSearchFilter || '' }
								onChange={ e => data.memberSearchFilter = e.currentTarget.value }
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
				<MembersList />
			</Container>
		</>
	);
});

export default MembersPane;
