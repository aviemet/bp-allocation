type VoteSource = 'kiosk' | 'mobile'

type BaseCollection = {
	_id: string
}

interface Member extends BaseCollection {
	firstName: string
	lastName: string
	fullName: string
	initials: string
	number: number
	code: string
	phone: string
	email: string
	createdAt: Date
}

interface Allocation {
	organization: string
	amount: number
	voteSource: VoteSource
	createdAt: Date
}

interface ChitVote {
	organization: string
	votes: number
	voteSource: VoteSource
	createdAt: Date
}

interface MemberTheme extends BaseCollection {
	theme: string
	member: string
	chits: number
	amount: number
	chitVotes: ChitVote[]
	allocations: Allocation[]
	createdAt: Date
}

interface Round {
	one: boolean
	two: boolean
}

interface Message extends BaseCollection {
	title: string
	subject: string
	body: string
	type: 'text' | 'email'
	active: boolean
	order: number
	includeLink: boolean
	optOutRounds: Round
	createdAt: Date
	updatedAt: Date
}

interface ChitVote {
	weight: number
	count: number
}

interface MatchPledge {
	_id: string
	amount: number
	member: string
	anonymous: boolean
	notes: string
	createdAt: Date
}

interface Organization extends BaseCollection {
	title: string
	theme: string
	ask: number
	description: string
	image: string
	chitVotes: ChitVote
	amountFromVotes: number
	topOff: number
	pledges: MatchPledge[]
	leverageFunds: number
	createdAt: Date

	save: number
	pledgeTotal: number
	votedTotal: number
	allocatedFunds: number
	need: number
	votes: number
}

interface OrgSave {
	org: string
	amount: number
	name: string
}

interface PresentationSettings extends BaseCollection {
	currentPage: string
	timerLength: number
	animateOrgs: boolean
	leverageVisible: boolean
	savesVisible: boolean
	colorizeOrgs: boolean
	chitVotingActive: boolean
	fundsVotingActive: boolean
	topupsActive: boolean
	resultsOffset: number
	useKioskChitVoting: boolean
	useKioskFundsVoting: boolean
	resultsVisited: boolean
	awardsPresentation: boolean
	awardAmount: number
	topupEmailConfirmation: boolean
	showAskOnOrgCards: boolean
	twilioRateLimit: number
}

interface MessageStatus {
	messageId: string
	sending: boolean
	sent: boolean
	error: boolean
}

interface Theme extends BaseCollection {
	title: string
	question: string
	quarter: string
	organizations: Organization[]
	topOrgsManual: string[]
	numTopOrgs: number
	chitWeight: number
	matchRatio: number
	consolationAmount: number
	consolationActive: boolean
	leverageTotal: number
	saves: OrgSave[]
	presentationSettings: string
	slug: string
	messagesStatus: MessageStatus[]

	pledgedTotal: number
	votedFunds: number
	fundsVotesCast: number
	chitVotesCast: number
	totalChitVotes: number
	totalMembers: number
	fundsVotingStarted: boolean
	chitVotingStarted: boolean
	consolationTotal: number
	leverageRemaining: number
	memberFunds: number
}
