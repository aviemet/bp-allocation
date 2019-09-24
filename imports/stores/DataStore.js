import { Meteor } from 'meteor/meteor';
import _ from 'lodash';
import { observable, action, autorun, toJS } from 'mobx';

import { Themes, PresentationSettings, Organizations, MemberThemes, Members } from '/imports/api';
import ThemeStore from './ThemeStore';
import OrgsCollection from './OrgsCollection';
import OrgStore from './OrgStore';
import SettingsStore from './SettingsStore';
import MembersCollection from './MembersCollection';

class DataStore {
	@observable themeId;
	@observable loading = true;
	@observable sidebarOpen = false;
	defaultMenuHeading = 'Battery Powered Allocation Night Themes!';
	@observable menuHeading = this.defaultMenuHeading;

	theme;
	settings;
	orgs;
	memberThemes;
	members;
	images;

	subscriptions = {};
	observers = {};

	@action
	loadData = autorun(() => {
		if(this.themeId) {
			this.loading = true;
			
			// Stop the subscriptions and observers which are about to be replaced
			Object.values(this.subscriptions).forEach(subscription => subscription.stop());
			Object.values(this.observers).forEach(observer => observer.stop());

			let promises = [];

			// Subscriptions to data stores

			// Theme
			promises.push(this._themeSubscription().then(theme => {
				// Presentation Settings
				promises.push(this._settingsSubscription(theme.presentationSettings));
				// Organizations
				promises.push(this._orgsSubscription());

				promises.push(this._membersSubscription());

				// Once all subscriptions are loaded and have returned data, set loading to false
				Promise.all(promises).then(values => {
					this.loading = false;
				});

				this.menuHeading = `Battery Powered Allocation Night: ${theme.title}`;
			}));
		} else {
			this.loading = true;
			this.menuHeading = this.defaultMenuHeading;
			this.theme = undefined;
			this.settings = undefined;
			this.orgs = undefined;
			this.memberThemes = undefined;
			this.members = undefined;
			this.images = undefined;
		}
	});

	_themeSubscription() {
		return new Promise((resolve, reject) => {

			this.subscriptions.theme = Meteor.subscribe('themes', this.themeId, {
				onReady: () => {
					const themeCursor = Themes.find({ _id: this.themeId });
					this.theme = new ThemeStore(themeCursor.fetch()[0], this);

					this.observers.theme = themeCursor.observe({
						added: theme => this.theme.refreshData(theme),
						changed: theme => this.theme.refreshData(theme)
					});
					
					resolve(toJS(this.theme));
				}
			});
		});
	}

	_orgsSubscription() {
		return new Promise((resolve, reject) => {

			this.subscriptions.orgs = Meteor.subscribe('organizations', this.themeId, {
				onReady: () => {
					const orgsCursor = Organizations.find({ theme: this.themeId });
					this.orgs = new OrgsCollection(orgsCursor.fetch(), this, OrgStore);

					this.observers.orgs = orgsCursor.observe({
						added: orgs => this.orgs.refreshData(orgs),
						changed: orgs => this.orgs.refreshData(orgs)
					});

					resolve(toJS(this.orgs));
				}
			});
		});
	}

	_membersSubscription() {
		return new Promise((resolve, reject) => {
	
			// Subscribe to MemberThemes
			this.subscriptions.memberThemes = Meteor.subscribe('memberThemes', this.themeId, {
				onReady: () => {
					// Fetch memberThemes and create list of _ids
					const memberThemesCursor = MemberThemes.find({ theme: this.themeId });
					const memberThemes = memberThemesCursor.fetch();
					const memberIds = memberThemes.map(memberTheme => memberTheme.member);
			
					// Subscribe to Members
					this.subscriptions.members = Meteor.subscribe('members', memberIds, {
						onReady: () => {
							const membersCursor = Members.find({ _id: { $in: memberIds }});
							const members = membersCursor.fetch();
	
							// Combine Members and MemberThemes into one object
							let membersCombined = members.map(member => {
								let memberTheme = _.find(memberThemes, ['member', member._id]);
								return Object.assign({ theme: memberTheme }, member);
							});
							this.members = new MembersCollection(membersCombined, this);
							this.members.parent = this;
	
							this.observers.members = membersCursor.observe({
								added: members => this.members.refreshData(members),
								changed: members => this.members.refreshData(members)
							});
	
							this.observers.memberThemes = memberThemesCursor.observe({
								added: members => this.members.refreshData(members),
								changed: members => this.members.refreshData(members)
							});
	
							resolve(toJS(this.members));
						}
					});
				}
			});
		});
	}

	_settingsSubscription(id) {
		return new Promise((resolve, reject) => {

			this.subscriptions.settings = Meteor.subscribe('presentationSettings', id, {
				onReady: () => {
					const settingsCursor = PresentationSettings.find({ _id: id });
					this.settings = new SettingsStore(settingsCursor.fetch()[0], this);
					this.settings.parent = this;

					this.observers.settings = settingsCursor.observe({
						added: settings => this.settings.refreshData(settings),
						changed: settings => this.settings.refreshData(settings)
					});

					resolve(toJS(this.settings));
				}
			});
		});
	}
}

export default DataStore;