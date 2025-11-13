import styled from "@emotion/styled"
import { Container } from "@mui/material"
import { useOrgs, useSettings } from "/imports/api/hooks"
import { OrgCard, OrgCardContainer } from "/imports/ui/components/Cards"

const Overlay = ({ visible }: { visible: boolean }) => (
	<DimOverlay visible={ visible }>
		{ /* <Image src='/img/BPLogo.svg' /> */ }
	</DimOverlay>
)

const Orgs = () => {
	const { settings } = useSettings()
	const { values: orgs, topOrgs } = useOrgs()

	const colorOrgs: Record<string, boolean> = {}
	topOrgs.forEach((org) => {
		colorOrgs[org._id] = true
	})

	return (
		<OrgsContainer>
			<PageTitle>Participating Organizations</PageTitle>
			<Container maxWidth="xl" sx={ { height: "100%" } }>
				<OrgCardContainer cols={ 3 } sx={ { paddingBottom: "clamp(0rem, -58.1818rem + 90.9091vh, 10rem)", height: "100%" } }>
					{ orgs?.map((org, i) => {
						return <OrgCard
							key={ org._id }
							org={ org }
							index={ i }
							size="big"
							overlay={ colorOrgs[org._id] ? <Overlay visible={ settings?.colorizeOrgs ?? false } /> : false }
							showAsk={ settings?.showAskOnOrgCards }
						/>
					}) }
				</OrgCardContainer>
			</Container>
		</OrgsContainer>
	)
}

const OrgsContainer = styled.div`
	display: flex;
	flex-direction: column;
	flex: 1;
	padding-top: 16px;
	padding-bottom: 16px;
	height: 100%;

	&& p{
		line-height: 1em;
	}
`

const PageTitle = styled.h2``

const DimOverlay = styled.div<{ visible: boolean }>`
	width: calc(100% + 10px);
	height: calc(100% + 10px);
	background-color: rgba(0,0,0,0.8);
	position: absolute;
	top: -5px;
	left: -5px;
	z-index: 1;
	opacity: ${({ visible }) => visible ? 1 : 0};
	transition: opacity 200ms ease-in-out;

	img {
		opacity: 0.125;
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}

`

export default Orgs
