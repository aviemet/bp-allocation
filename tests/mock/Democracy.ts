import orgTransformer from "/imports/server/transformers/orgTransformer"

const theme = {
	_id: "ArtXBdjZYvYSWcW5N",
	title: "T12 Test Theme",
	presentationSettings: "hnJb4SBPkFQ8KBnRa",
	organizations: [
		"fWZLWouDrsYHQRZe2",
		"iBTQcWD9NZppHfrJ8",
		"497FQGwnAhRCN7fh3",
		"9E2djP6GC7ftadRZn",
		"Kv2bKjxcCafXCRi6D",
		"SpadwpFGuBHM65Ww3",
		"wcZzEZyWJP7m2dXMd",
		"5rmNtzSDMbHY8kArF",
		"MhaovtXsWG4HgeiZL",
		"mu25eGtASLPySzMTT",
		"GnqeDtd4nhvkBqt8L",
		"Hvn5eL6prMFFJKsi2",
	],
	topOrgsManual: [],
	numTopOrgs: 5,
	chitWeight: 3,
	matchRatio: 2,
	consolationAmount: 10000,
	consolationActive: true,
	leverageTotal: 1337842,
	saves: [],
	createdAt: "2019-10-28T17:28:59.960Z",
}

const settings = {
	useKioskFundsVoting: false,
}

const orgs = [
	{
		_id: "iBTQcWD9NZppHfrJ8",
		theme: "ArtXBdjZYvYSWcW5N",
		title: "Campaign Legal Center",
		ask: 250000,
		chitVotes:
		{
			count: 0,
			weight: 153,
		},
		amountFromVotes: 37283,
		topOff: 0,
		pledges: [],
		leverageFunds: 0,
		createdAt: "2019-10-28T20:27:08.432Z",
	},
	{
		_id: "497FQGwnAhRCN7fh3",
		theme: "ArtXBdjZYvYSWcW5N",
		title: "CommunityConnect Labs",
		ask: 250000,
		chitVotes:
		{
			count: 0,
			weight: 214,
		},
		amountFromVotes: 58200,
		topOff: 0,
		pledges: [
			{
				amount: 10000,
				_id: "8trsaSQ5wsABCqEbr",
				createdAt: "2019-10-22T23:16:27.135Z",
			},
		],
		leverageFunds: 0,
		createdAt: "2019-10-28T20:27:08.428Z",
	},
	{
		_id: "wcZzEZyWJP7m2dXMd",
		theme: "ArtXBdjZYvYSWcW5N",
		title: "Groundswell Action Fund",
		ask: 300000,
		chitVotes:
		{
			count: 0,
			weight: 135,
		},
		amountFromVotes: 35000,
		topOff: 0,
		pledges: [
			{
				amount: 10000,
				_id: "P8NJ9SeswpzNnP5WN",
				createdAt: "2019-10-22T23:16:36.034Z",
			},
		],
		leverageFunds: 0,
		createdAt: "2019-10-28T20:27:08.433Z",
	},
	{
		_id: "MhaovtXsWG4HgeiZL",
		theme: "ArtXBdjZYvYSWcW5N",
		title: "IGNITE",
		ask: 250000,
		chitVotes:
		{
			count: 0,
			weight: 204,
		},
		amountFromVotes: 54600,
		topOff: 0,
		pledges: [
			{
				amount: 10000,
				_id: "krtRDpQPWap7TC7vM",
				createdAt: "2019-10-22T23:16:30.830Z",
			},
		],
		leverageFunds: 0,
		createdAt: "2019-10-28T20:27:08.431Z",
	},
	{
		_id: "GnqeDtd4nhvkBqt8L",
		theme: "ArtXBdjZYvYSWcW5N",
		title: "Represent.Us",
		ask: 250000,
		chitVotes:
		{
			count: 0,
			weight: 213,
		},
		amountFromVotes: 105200,
		topOff: 144800,
		pledges: [],
		leverageFunds: 0,
		createdAt: "2019-10-28T20:27:08.429Z",
	},
].map(org => orgTransformer(org, { theme, settings }))

export default { orgs, theme, settings }
