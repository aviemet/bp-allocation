import styled from "@emotion/styled"
import {
	Container,
} from "@mui/material"
import { useOrgs, useSettings } from "/imports/api/hooks"
import { OrgCard, OrgCardContainer } from "/imports/ui/components/Cards"

const TopOrgs = () => {
	const { settings } = useSettings()
	const { topOrgs } = useOrgs()

	return (
		<TopOrgsContainer maxWidth="xl">
			<PageTitle>Top { topOrgs.length } Organizations</PageTitle>
			<Container maxWidth="lg" sx={ { height: "100%", paddingBottom: "2rem" } }>
				<OrgCardContainer cols={ 3 } sx={ { height: "80%" } }>
					{ topOrgs.map((org) => (
						<OrgCard
							key={ org._id }
							org={ org }
							animateClass={ settings?.animateOrgs || false }
							size="big"
							showAsk={ settings?.showAskOnOrgCards || false }
						/>
					)) }
				</OrgCardContainer>
			</Container>
		</TopOrgsContainer>
	)
}

const TopOrgsContainer = styled(Container)`
	padding: 16px;
	flex: 1;
	display: flex;
	flex-direction: column;
	justify-content: space-around;
	align-items: center;
	height: 100%;
`

const PageTitle = styled.h2``

export default TopOrgs
