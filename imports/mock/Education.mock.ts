import { SettingsData, ThemeData } from "../api/db"
import { uuid } from "../lib/utils"
import orgTransformer from "/imports/server/transformers/orgTransformer"

const theme: ThemeData = {
	_id: "fEYxEXpMcHuhjoNzD",
	title: "T10 Test Theme",
	presentationSettings: "wofZFoDwsp2x9q2PG",
	organizations: [
		"ZPGuoKferMtRLcteq",
		"qhLLMjGwGNr3frshr",
		"iMJiLfte2Wo4i6YwS",
		"7JudfyraRLNbLAQuF",
		"6tTw6bLwrdBxeGQpp",
		"CK3kc3ktbKdn7jCC3",
		"SuyDNaJyrbBmDJZZM",
		"SQYxczYmm9nHNNN3X",
		"j687kt5CtszAmyeL6",
		"wfEe39uitLMZQgzYz",
		"kGoxH6vFeEMfmtzqC",
		"GPbHzBwpjaGwupMox",
	],
	topOrgsManual: [
		"7JudfyraRLNbLAQuF",
	],
	numTopOrgs: 6,
	chitWeight: 3,
	matchRatio: 2,
	consolationAmount: 10000,
	consolationActive: false,
	leverageTotal: 1197552.6,
	saves: [
		{
			_id: uuid(),
			org: "7JudfyraRLNbLAQuF",
			amount: 125000,
		},
	],
	createdAt: new Date("2019-09-26T23:32:12.403Z"),
}

const settings: SettingsData = {
	_id: uuid(),
	useKioskFundsVoting: false,
}

const orgs = [
	{
		_id: "7JudfyraRLNbLAQuF",
		theme: "fEYxEXpMcHuhjoNzD",
		title: "Center for Good Food Purchasing",
		ask: 250000,
		chitVotes:
		{
			count: 39,
			weight: 112,
		},
		amountFromVotes: 58400,
		topOff: 0,
		pledges: [],
		leverageFunds: 0,
		createdAt: "2019-10-25T22:24:58.582Z",
	},
	{
		_id: "iMJiLfte2Wo4i6YwS",
		theme: "fEYxEXpMcHuhjoNzD",
		title: "Code for America",
		ask: 250000,
		chitVotes:
		{
			count: 0,
			weight: 153,
		},
		amountFromVotes: 66600,
		topOff: 183400,
		pledges: [],
		leverageFunds: 0,
		createdAt: "2019-10-25T22:24:58.586Z",
	},
	{
		_id: "qhLLMjGwGNr3frshr",
		theme: "fEYxEXpMcHuhjoNzD",
		title: "Education Outside",
		ask: 250000,
		chitVotes:
		{
			count: 42,
			weight: 114,
		},
		amountFromVotes: 41000,
		topOff: 0,
		pledges: [
			{
				amount: 17500,
				_id: "5LpH5sPvWHTsibnYB",
				createdAt: "2019-09-26T23:36:11.850Z",
			},
		],
		leverageFunds: 0,
		createdAt: "2019-10-25T22:24:58.589Z",
	},
	{
		_id: "6tTw6bLwrdBxeGQpp",
		theme: "fEYxEXpMcHuhjoNzD",
		title: "Food as Medicine Coalition",
		ask: 300000,
		chitVotes:
		{
			count: 0,
			weight: 171,
		},
		amountFromVotes: 59000,
		topOff: 0,
		pledges: [
			{
				amount: 4500,
				_id: "wp9beG3HKfGw2bsjh",
				createdAt: "2019-09-26T23:36:05.402Z",
			},
		],
		leverageFunds: 0,
		createdAt: "2019-10-25T22:24:58.598Z",
	},
	{
		_id: "SuyDNaJyrbBmDJZZM",
		theme: "fEYxEXpMcHuhjoNzD",
		title: "No Kid Hungry California",
		ask: 250000,
		chitVotes:
		{
			count: 0,
			weight: 194,
		},
		amountFromVotes: 34083,
		topOff: 0,
		pledges: [
			{
				amount: 40000,
				_id: "ZJEhJdQxvxbBPsyNA",
				createdAt: "2019-09-26T23:35:50.694Z",
			},
		],
		leverageFunds: 0,
		createdAt: "2019-10-25T22:24:58.608Z",
	},
	{
		_id: "j687kt5CtszAmyeL6",
		theme: "fEYxEXpMcHuhjoNzD",
		title: "REAL Food in Schools Collaborative",
		ask: 300000,
		chitVotes:
		{
			count: 0,
			weight: 185,
		},
		amountFromVotes: 47400,
		topOff: 0,
		pledges: [
			{
				amount: 6500,
				_id: "QuSC8KgNizyqo8ecF",
				createdAt: "2019-09-26T23:36:00.536Z",
			},
		],
		leverageFunds: 0,
		createdAt: "2019-10-25T22:24:58.626Z",
	},
].map(org => orgTransformer({
	...org,
	createdAt: new Date(org.createdAt),
	pledges: org.pledges?.map(p => ({ ...p, createdAt: new Date(p.createdAt) })),
}, { theme, settings, memberThemes: [] }))

export default { orgs, theme, settings }
