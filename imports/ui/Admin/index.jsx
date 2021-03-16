import React from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'

import { Segment, Container } from 'semantic-ui-react'

import {
	SettingsPane,
	MessagingPane,
	MembersPane,
	OrganizationsPane,
	ChitVotingPane,
	AllocationPane,
	LeveragePane,
	PresentationPane,
	MessageEdit
} from '/imports/ui/Admin/Panes'

const Admin = () => {
	return (
		<Container>
			<Segment>
				<Switch>
					<Route exact path='/admin/:id/orgs' component={ OrganizationsPane } />
					<Route exact path='/admin/:id/members' component={ MembersPane } />
					<Route exact path='/admin/:id/chits' component={ ChitVotingPane } />
					<Route exact path='/admin/:id/allocation' component={ AllocationPane } />
					<Route exact path='/admin/:id/leverage' component={ LeveragePane } />

					<Route path='/admin/:id/messaging' component={ MessagingPane } />

					<Route exact path={ ['/admin/:id', '/admin/:id/presentation'] } component={ PresentationPane } />

					<Route exact path='/admin/:id/settings' render={ ({ match }) => <Redirect to={ `/admin/${match.params.id}/settings/general` } /> } />
					<Route exact path='/admin/:id/settings/:activeTab' component={ SettingsPane } />
					<Route exact path='/admin/:id/settings/messages/:messageId' component={ MessageEdit } />
				</Switch>
			</Segment>
		</Container>
	)
}

export default Admin
