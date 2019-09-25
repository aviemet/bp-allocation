import { assert, expect } from 'chai';
import Leverage from './Leverage';

const leverageRemaining = 900000;

const orgs = [
	{
		ask: 250000,
		allocatedFunds: 67432,
		amountFromVotes: 42432,
		chitVotes: {count: 0, weight: 207},
		leverageFunds: 182568,
		pledges: [,
			{amount: 2500, _id: "Zifj5DDZKkbyAjN7J"},
			{amount: 10000, _id: "b4zvs9EdRstfvMREC"}
		],
		need: 182568,
		pledgeTotal: 25000,
		theme: "DRbZ2ob63kpyaidMc",
		title: "YR Media",
		save: 0,
		topOff: 0,
		votes: 207,
		_id: "9FStDcCzXfmp44NFc"
	},

	{
		ask: 250000,
		allocatedFunds: 74984,
		amountFromVotes: 54984,
		chitVotes: {count: 0, weight: 204},
		leverageFunds: 175016,
		pledges: [,
			{amount: 10000, _id: "DfsyHWokta276DycP"}
		],
		need: 175016,
		pledgeTotal: 20000,
		theme: "DRbZ2ob63kpyaidMc",
		title: "Young Women's Freedom Center",
		save: 0,
		topOff: 0,
		votes: 204,
		_id: "36azL9zW7yNTEhhpw"
	},
	{
		ask: 250000,
		allocatedFunds: 83095,
		amountFromVotes: 73095,
		chitVotes: {count: 0, weight: 192},
		leverageFunds: 166905,
		pledges: [,
			{amount: 5000, _id: "gsiobD2HGTn8vDaMp"}
		],
		need: 166905,
		pledgeTotal: 10000,
		theme: "DRbZ2ob63kpyaidMc",
		title: "Life Learning Academy",
		save: 0,
		topOff: 0,
		votes: 192,
		_id: "6Amuf4xuykuiscftk"
	},
	{
		ask: 300000,
		allocatedFunds: 50882,
		amountFromVotes: 48882,
		chitVotes: {count: 0, weight: 172},
		leverageFunds: 160300,
		pledges: [,
			{amount: 1000, _id: "tFb5fvCJiwhaQZfPT"}
		],
		need: 249118,
		pledgeTotal: 2000,
		theme: "DRbZ2ob63kpyaidMc",
		title: "National Center for Youth Law",
		save: 0,
		topOff: 0,
		votes: 172,
		_id: "cyYNLcXHr44HHsM73",
	},
	{
		ask: 250000,
		allocatedFunds: 250000,
		amountFromVotes: 77145,
		chitVotes: {count: 0, weight: 162},
		leverageFunds: 0,
		pledges: [],
		need: 0,
		pledgeTotal: 0,
		theme: "DRbZ2ob63kpyaidMc",
		title: "Pivotal",
		save: 0,
		topOff: 172855,
		votes: 162,
		_id: "bSnvStwQumX5DtG5f",
	}
];

describe("Leverage object", function() {
	let leverage;
	before(function() {
		leverage = new Leverage(orgs, leverageRemaining);
	});

	context("Leverage object initalized correctly", function() {


		it("Should have 5 orgs", function() {
			expect(leverage.orgs.length).to.equal(5);
		});

		it("Should save the remaining leverage", function() {
			expect(leverage.leverageRemaining).to.equal(leverageRemaining)
		});

	});

	context("Leverage rounds", function() {

		it("Should generate leverage rounds", function() {
			const rounds = leverage.getLeverageSpreadRounds();
			console.log({ rounds });
			expect(rounds).to.not.be.null;
		});
	});
});
