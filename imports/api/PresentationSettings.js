import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

const PresentationSettings = new Mongo.Collection('presentationSettings');

const PresentationSettingsSchema = new SimpleSchema({
	currentPage: {
		type: String,
		label: 'Currently displayed presentation page',
		required: false,
		// TODO: enum? const array of options?
		defaultValue: 'intro'
	},
	timerLength: {
		type: SimpleSchema.Integer,
		label: 'Length of timers in seconds',
		required: false,
		defaultValue: 600
	},
	animateOrgs: {
		type: Boolean,
		label: 'Wether to animate the Top Orgs',
		required: false,
		defaultValue: true
	},
	leverageVisible: {
		type: Boolean,
		label: 'Show leverage on presentation',
		required: false,
		defaultValue: false
	},
	savesVisible: {
		type: Boolean,
		label: 'Show saves on presentation',
		required: false,
		defaultValue: false
	},
	colorizeOrgs: {
		type: Boolean,
		label: 'Top Org cards have color on all orgs page',
		required: false,
		defaultValue: false
	},
	chitVotingActive: {
		type: Boolean,
		label: 'Activate chit voting',
		required: false,
		defaultValue: false
	},
	fundsVotingActive: {
		type: Boolean,
		label: 'Activate funds voting',
		required: false,
		defaultValue: false
	},
	resultsOffset: {
		type: Number,
		label: 'Amount to offset total displayed on the results page',
		required: false,
		defaultValue: 0
	},
	useKioskChitVoting: {
		type: Boolean,
		label: 'Will the chit voting totals be entered manually or taken from kiosk voting?',
		required: false,
		defaultValue: false
	},
	useKioskFundsVoting: {
		type: Boolean,
		label: 'Will the funds voting totals be entered manually or taken from kiosk voting?',
		required: false,
		defaultValue: false
	},
	resultsVisited: {
		type: Boolean,
		label: 'Have the results been displayed yet',
		required: false,
		defaultValue: false
	}
});

PresentationSettings.attachSchema(PresentationSettingsSchema);

export { PresentationSettings, PresentationSettingsSchema };
