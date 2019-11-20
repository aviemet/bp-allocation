import { assert, expect } from 'chai';
import _ from 'lodash';
import Leverage from './Leverage';
import { Youth, Education, Democracy } from './Leverage.mock';
import OrgsCollection from '/imports/stores/OrgsCollection';
import OrgStore from '/imports/stores/OrgStore';

describe("Leverage object", function() {

	context("Leverage object initalized correctly", function() {
		const leverage = new Leverage(Youth, 100);

		it("Should have 5 orgs", function() {
			expect(leverage.orgs.length).to.equal(5);
		});

	});
});

describe("Education Theme leverage spread", function() {
	const orgs = new OrgsCollection(Education.orgs, { theme: Education.theme, settings: Education.settings, displayedPledges: new Set() }, OrgStore);
	const leverage = new Leverage(orgs.values,  639169.6);
	const rounds = leverage.getLeverageSpreadRounds();

	it("Should generate leverage rounds", function() {
		expect(rounds).to.be.an('array').that.is.not.empty;
		expect(rounds.length).to.equal(3);
	});

	it("Should spread leverage correctly to the orgs - Education", function() {
		const orgSpreadByRound = {
			// Center for good food purchasing
			'7JudfyraRLNbLAQuF': [66600, 0, 0],
			// Code for America
			'iMJiLfte2Wo4i6YwS': [0, 0, 0],
			// Education Outside
			'qhLLMjGwGNr3frshr': [64606.98, 72026.03, 25723.14],
			// Food as Medicine Coalition
			'6tTw6bLwrdBxeGQpp': [57806.24, 64444.34, 23015.45],
			// No Kid Hungry California
			'SuyDNaJyrbBmDJZZM': [96981.03, 38935.97, 0],
			// REAL Food in Schools Collaborative
			'j687kt5CtszAmyeL6': [51345.55, 57241.74, 20443.13]
		}
		// Step through each round
		rounds.forEach((round, nRounds) => {
			// Step through each org in each round
			round.orgs.forEach(org => {
				if(org.roundFunds !== orgSpreadByRound[org._id][nRounds]) {
					// console.log({ org, comp: orgSpreadByRound[org._id], nRounds })
				}
				// Compare the org leverage funds in the round to the expected value from above
				expect(org.roundFunds).to.equal(orgSpreadByRound[org._id][nRounds]);
			});
		});
	});
});

describe("Democracy Theme leverage spread", function() {
	const orgs = new OrgsCollection(Democracy.orgs, { theme: Democracy.theme, settings: Democracy.settings, displayedPledges: new Set() }, OrgStore);
	const leverage = new Leverage(orgs.values, 802759);
	const rounds = leverage.getLeverageSpreadRounds();

	it("Should generate leverage rounds", function() {
		expect(rounds).to.be.an('array').that.is.not.empty;
		expect(rounds.length).to.equal(4);
	});

	it("Should spread leverage correctly to the orgs - Democracy", function() {
		const orgSpreadByRound = {
			// Campaign Legal Center
			'iBTQcWD9NZppHfrJ8': [60453.02, 61665.87, 61930.24, 26509.87],
			// 'CommunityConnect Labs'
			'497FQGwnAhRCN7fh3': [126798.44, 45001.56, 0, 0],
			// Groundswell Action Fund
			'wcZzEZyWJP7m2dXMd': [89180.49, 90969.69, 64849.82, 0],
			// IGNITE
			'MhaovtXsWG4HgeiZL': [120961.17, 54438.83, 0, 0],
			// Represent.Us
			'GnqeDtd4nhvkBqt8L': [0, 0, 0, 0]
		}
		// Step through each round
		rounds.forEach((round, nRounds) => {
			// Step through each org in each round
			round.orgs.forEach(org => {
				if(org.roundFunds !== orgSpreadByRound[org._id][nRounds]) {
					// console.log({ org, comp: orgSpreadByRound[org._id], nRounds });
				}
				// Compare the org leverage funds in the round to the expected value from above
				expect(org.roundFunds).to.equal(orgSpreadByRound[org._id][nRounds]);
			});
		});
	});
});
