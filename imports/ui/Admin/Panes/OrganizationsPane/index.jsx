/* eslint-disable react/display-name */
import React, { useState } from 'react'
import numeral from 'numeral'
import { observer } from 'mobx-react-lite'
import { useTheme, useOrgs } from '/imports/api/providers'

import { OrganizationMethods } from '/imports/api/methods'

import { Header, Grid, Form, Container, Table, Button, Popup, Icon, Loader } from 'semantic-ui-react'
import styled from 'styled-components'

import ImportOrgs from './ImportOrgs'
import EditableText from '/imports/ui/Components/EditableText'
import ConfirmationModal from '/imports/ui/Components/ConfirmationModal'

const OrganizationsPane = observer(props => {
	const { theme } = useTheme()
	const { orgs, isLoading: orgsLoading } = useOrgs()

	const [ orgTitle, setOrgTitle ] = useState('')
	const [ orgAsk, setOrgAsk ] = useState('')
	const [ orgDescription, setOrgDescription ] = useState('')

	const [ modalOpen, setModalOpen ] = useState(false)
	const [ modalHeader, setModalHeader ] = useState('')
	const [ modalContent, setModalContent ] = useState('')
	const [ modalAction, setModalAction ] = useState()

	const MAX_ORG_CHARACTERS = 50

	const handleNewOrgSubmit = (e) => {
		e.preventDefault()

		e.target.reset()

		let data = {
			title: orgTitle,
			ask: parseFloat(orgAsk.replace(/[^\d.]/g, '')),
			description: orgDescription,
			theme: theme._id
		}

		OrganizationMethods.create.call(data, (err, res) => {
			if(err){
				console.error(err)
			} else {
				setOrgTitle('')
				setOrgAsk('')
				setOrgDescription('')
			}
		})
	}

	const updateOrg = (id, field) => value => {
		let data = {}
		data[field] = value
		OrganizationMethods.update.call({ id: id, data })
	}

	const removeOrg = id => () => {
		OrganizationMethods.remove.call(id, (err, res) => {
			if(err) console.error(err)
		})
	}

	if(orgsLoading) return <Loader active />

	return (
		<>
			<OrgsContainer>
				<Grid.Row>
					<Header as="h1">
						{ `Organizations for Theme: ${ theme.title }` }
						<ImportOrgs />
					</Header>
				</Grid.Row>

				<Grid.Row>

					<Form onSubmit={ handleNewOrgSubmit }>
						<Form.Group>
							<Form.Input
								name='orgTitle'
								width={ 8 }
								type='text'
								placeholder='Organization Name'
								value={ orgTitle }
								onChange={ e => setOrgTitle(e.target.value) }
							/>

							<Form.Input
								name='orgAsk'
								width={ 4 }
								type='text'
								placeholder='Ask'
								iconPosition='left'
								icon='dollar sign'
								value={ orgAsk }
								onChange={ e => setOrgAsk(e.target.value) }
							/>

							<Form.Button width={ 4 } type='submit'>Add</Form.Button>
						</Form.Group>

						<Form.TextArea
							name='orgDescription'
							placeholder='Brief description of the organization'
							value={ orgDescription }
							onChange={ e => setOrgDescription(e.target.value) }
						/>

					</Form>

				</Grid.Row>
				
				<Table size='small' sortable striped celled structured>
					<Table.Header>
						<Table.Row>
							<Table.HeaderCell>Organization</Table.HeaderCell>
							<Table.HeaderCell collapsing>Ask</Table.HeaderCell>
							<Table.HeaderCell>Description</Table.HeaderCell>
							<Table.HeaderCell collapsing></Table.HeaderCell>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{ orgs.values.map((org, i) => {
							const titleLength = {
								warning: {
									test: org.title.length >= MAX_ORG_CHARACTERS - 5 && org.title.length < MAX_ORG_CHARACTERS,
									message: () => <><p>This organization title is a little long at <b><em>{org.title.length}</em></b> characters. It may not appear correctly in the presentation. </p><p> Please reduce it to under 50 characters.</p></>
								},
								error: {
									test: org.title.length >= MAX_ORG_CHARACTERS,
									message: () => <><p>This organization title is too long at <b><em>{org.title.length}</em></b> characters. It most likely won&apos;t appear correctly in the presentation.</p><p> Please reduce it to under 50 characters.</p></>
								}
							}
							return (
								<Table.Row 
									key={ i }
									warning={ titleLength.warning.test }
									error={ titleLength.error.test }
								>
									<Table.Cell>
										{ titleLength.warning.test && <Popup content={ titleLength.warning.message } trigger={ <Icon name='info' float='left' /> } /> }
										{ titleLength.error.test && <Popup content={ titleLength.error.message } trigger={ <Icon name='info' float='left' /> } /> }
										<EditableText onSubmit={ updateOrg(org._id, 'title') }>
											{ org.title ? org.title : '' }
										</EditableText>
									</Table.Cell>

									<EditableText as={ Table.Cell } onSubmit={ updateOrg(org._id, 'ask') } format={ value => numeral(value).format('$0,0') }>
										{ org.ask ? org.ask : '' }
									</EditableText>

									<EditableText as={ Table.Cell } onSubmit={ updateOrg(org._id, 'description') } type='textarea'>
										{ org.description ? org.description : '' }
									</EditableText>

									<Table.Cell>
										<Button icon='trash' onClick={ () => {
											setModalHeader('Permanently Delete This Organization?')
											setModalContent(`This will permanently remove ${org.title} from this theme and all associated data. This process cannot be undone.`)
											setModalAction( () => removeOrg(org._id) )
											setModalOpen(true)
										} } />
									</Table.Cell>
								</Table.Row>
							)
						} ) }
					</Table.Body>
				</Table>

			</OrgsContainer>
			<ConfirmationModal
				isModalOpen={ modalOpen }
				handleClose={ () => setModalOpen(false) }
				header={ modalHeader }
				content={ modalContent }
				confirmAction={ modalAction }
			/>
		</>
	)
})

const OrgsContainer = styled(Container)`
	&& h1.ui.header {
		margin-bottom: 1rem;
	}
`

export default OrganizationsPane
