import _ from 'lodash';

const COLORS = ["#6D35A4", "#E1333E", "#02D3BE", "#18C64D", "#D89111", "#01B0FF"];

const KIOSK_PAGES = { info: 'info', chit: 'chit', funds: 'funds' };

const roundFloat = (value, decimal) => {
	decimal = decimal || 2;
	return parseFloat((value).toFixed(decimal));
}

const _initLeverageVars = orgsOriginal => {
	let sumRemainingOrgs = 0;
	let orgs = _.cloneDeep(orgsOriginal).map(org => {
		// Set up some variables
		org.allocatedFunds = roundFloat(org.amount_from_votes + org.pledges + org.topoff);
		org.leverageFunds = 0; // Accumulator for funds recieved from leverage spread
		org.need = roundFloat(org.ask - org.allocatedFunds); // Amount needed to be fully funded

		// Use the loop to calculate the funding total of orgs not fully funded
		sumRemainingOrgs = roundFloat(sumRemainingOrgs + org.allocatedFunds);
		return org;
	});

	return { orgs, sumRemainingOrgs };
}

const getLeverageSpreadRounds = (topOrgs, leverageRemaining) => {
	let { orgs, sumRemainingOrgs } = _initLeverageVars(topOrgs);

	/////////////////////////
	// Loop through rounds //
	/////////////////////////
	let rounds = [];
	let nRounds = 1;
	while(leverageRemaining > 0 && nRounds < 10) {
		console.log("Round "+nRounds);
		let round = {
			leverageRemaining: leverageRemaining,
			sumRemainingOrgs: sumRemainingOrgs
		};

		let trackers = {
			fullyFundedOrgs: orgs.reduce((sum, org) => {
				return sum + (org.need <= 0 ? 1 : 0);
			}, 0),
			newSumRemainingOrgs: 0,
			givenThisRound: 0
		};

		///////////////////////
		// Iterate over orgs //
		///////////////////////
 		let roundOrgs = orgs.map(org => {
 			/** DEFAULTS **/
 			org.roundFunds = 0; // Amount allocated to org this round
 			org.percent = 0; // Percentage of remaining pot used for allocation

 			// Calculate all percentage on 1st, subsequently
 			// only calculate percentage if not fully funded
 			if(nRounds === 1 || org.need > 0 && sumRemainingOrgs !== 0) {
	 			// Percent: (funding amount from voting/pledges) / (sum of that amount for orgs not yet fully funded)
	 			org.percent = org.allocatedFunds / sumRemainingOrgs;
 			}

 			// Give funds for this round
		  org.roundFunds = roundFloat(Math.min(
		    org.percent * leverageRemaining,
		    org.need
		  ));

 			// Accumulate the running total of all accrued funds during leverage rounds
 			org.leverageFunds = roundFloat(org.leverageFunds + org.roundFunds);

			// Amount needed to be fully funded
 			org.need = roundFloat(org.ask - org.allocatedFunds - org.leverageFunds);

 			// Decrease remaining leverage by amount awarded
 			trackers.givenThisRound = roundFloat(trackers.givenThisRound + org.roundFunds);

 			// Only orgs not yet funded are counted in the percentage ratio for next round
 			if(org.need > 0){
 				trackers.newSumRemainingOrgs = roundFloat(trackers.newSumRemainingOrgs + org.allocatedFunds);
 			} else {
 				trackers.fullyFundedOrgs++;
 			}

 			return org;
 		});
		//////////////////
		// End orgs.map //
		//////////////////

 		sumRemainingOrgs = trackers.newSumRemainingOrgs;
 		leverageRemaining = roundFloat(leverageRemaining - trackers.givenThisRound);

 		// If only 1 org is unfunded, we grant the rest to that org and finish
 		if(topOrgs.length - trackers.fullyFundedOrgs <= 1) {
 			roundOrgs = roundOrgs.map(org => {
 				if(org.need > 0) {
 					// console.log(org.title);
 					org.leverageFunds = roundFloat(org.leverageFunds + leverageRemaining);
 					// leverageRemaining = 0; // To escape the loop
 				}
 				return org;
 			});
 		}

 		round.orgs = _.cloneDeep(roundOrgs);

 		rounds.push(round);

 		nRounds++;
	}
	///////////////
	// End while //
	///////////////

	// console.log({rounds});

	return rounds;
}

export { COLORS, KIOSK_PAGES, roundFloat, getLeverageSpreadRounds };
