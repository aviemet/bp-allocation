import React from 'react'
import PropTypes from 'prop-types'

import { withRouter } from 'react-router-dom'

import { Header, Icon, Menu } from 'semantic-ui-react'
import MenuLink from './MenuLink'

import { observer } from 'mobx-react-lite'
import { useData } from '/imports/api/providers'

import styled from 'styled-components'

const Links = withRouter(observer(({ activeMenuItem }) => {
	const data = useData()

	return(
		<MenuContainer>
			<Menu vertical>
				<MenuLink 
					to={ `/admin/${data.themeId}/orgs` }
					active={ activeMenuItem === 'orgs' }
					iconPosition='left'
				>
					<Icon name='building' /> Orgs
				</MenuLink>

				<MenuLink 
					to={ `/admin/${data.themeId}/members` }
					active={ activeMenuItem === 'members' }
					iconPosition='left'
				>
					<Icon name='users' /> Members
				</MenuLink>

				<MenuLink 
					to={ `/admin/${data.themeId}/chits` }
					active={ activeMenuItem === 'chits' }
					iconPosition='left'
				>
					<Icon name='star' /> Chit Votes
				</MenuLink>

				<MenuLink 
					to={ `/admin/${data.themeId}/allocation` }
					active={ activeMenuItem === 'allocation' }
					iconPosition='left'
				>
					<Icon name='dollar' /> Allocations
				</MenuLink>

				<MenuLink 
					to={ `/admin/${data.themeId}/leverage` }
					active={ activeMenuItem === 'leverage' }
					iconPosition='left'
				>
					<Icon name='chart pie' /> Leverage
				</MenuLink>

				<MenuLink 
					to={ `/admin/${data.themeId}/presentation` }
					active={ activeMenuItem === 'presentation' }
					iconPosition='left'
				>
					<Icon name='chart bar' /> Presentation
				</MenuLink>
			</Menu>
			<br />

			<Menu vertical>
				<MenuLink
					to={ `/admin/${data.themeId}/settings` }
					active={ activeMenuItem === 'settings' }
					iconPosition='left'
				>
					<Icon name='setting'/> Settings
				</MenuLink>

				<MenuLink
					to={ `/admin/${data.themeId}/messaging` }
					active={ activeMenuItem === 'messaging' }
					iconPosition='left'
				>
					<Icon name='mail'/> Messaging
				</MenuLink>
			</Menu>

			{/* Pages */}
			<Header as={ 'h1' }>Pages</Header>

			<Menu vertical>
				<MenuLink to={ `/kiosk/${data.themeId}` }>
					Kiosk
				</MenuLink>

				<MenuLink to={ `/feedback/${data.themeId}` }>
					Feedback
				</MenuLink>

				<MenuLink to={ `/presentation/${data.themeId}` } target='_blank'>
					Presentation
				</MenuLink>

				<MenuLink to={ `/pledges/${data.themeId}` } target='_blank'>
					Pledge Inputs
				</MenuLink>
			</Menu>
		</MenuContainer>
	)
}))

const MenuContainer = styled.div`
	& .ui.menu.vertical {
		width: inherit;
		border-radius: 0;

		.item {
			border-radius: 0;
		}
	}
`

Links.propTypes = {
	activeMenuItem: PropTypes.string
}

export default Links