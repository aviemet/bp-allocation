import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

// Define Collection
const Presentation = new Mongo.Collection('presentation');

const PresentationSchema = new SimpleSchema({
	'topOrgsManual.$': SimpleSchema.RegEx.Id,
	currentPage: {
		type: String,
		label: 'Currently displayed presentation page',
		required: false,
		defaultValue: 'intro'
	},
	// Theme settings
	numTopOrgs: {
		type: Number,
		defaultValue: 5,
		required: false
	},
	chit_weight: {
		type: SimpleSchema.Integer,
		label: 'Multiplicant weight of chits vs. non-present votes',
		required: false,
		defaultValue: 3
	},
	timer_length: {
		type: SimpleSchema.Integer,
		label: 'Length of timers in seconds',
		required: false,
		defaultValue: 600
	},
	animate_orgs: {
		type: Boolean,
		label: 'Wether to animate the Top Orgs',
		required: false,
		defaultValue: true
	},
	match_ratio: {
		type: SimpleSchema.Integer,
		label: 'Multiplicant of dollar match values in pledge round',
		required: false,
		defaultValue: 2
	},
	leverage_total: {
		type: Number,
		label: 'Total amount to allocate for this theme',
		required: false
	},
	leverage_used: {
		type: Number,
		label: 'Amount of leverage allocated',
		required: false,
		defaultValue: 0
	},
	leverage_visible: {
		type: Boolean,
		label: 'Show leverage on presentation',
		required: false,
		defaultValue: false
	},
	results_offset: {
		type: Number,
		label: 'Amount to offset total displayed on the results page',
		required: false,
		defaultValue: 0
	},
	createdAt: {
		type: Date,
		autoValue: () => (new Date())
	}
});

Presentation.attachSchema(PresentationSchema);

// Set permissions
Presentation.allow({
	insert: (userId, doc) => {
		return true
	}
});

export { Presentation, PresentationSchema };
