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
		label: 'Top Org cards ahve color on all orgs page',
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
	}
});

PresentationSettings.attachSchema(PresentationSettingsSchema);

export { PresentationSettings, PresentationSettingsSchema };
