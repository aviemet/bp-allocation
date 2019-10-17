import { Meteor } from 'meteor/meteor';
import _ from 'lodash';
import { observable, action, autorun, toJS } from 'mobx';

import { Themes, PresentationSettings, Organizations, MemberThemes, Members } from '/imports/api';
import ThemeStore from './ThemeStore';
import OrgsCollection from './OrgsCollection';
import OrgStore from './OrgStore';
import SettingsStore from './SettingsStore';
import MemberThemesCollection from './MemberThemesCollection';
import MemberThemeStore from './MemberThemeStore';
import MembersCollection from './MembersCollection';
import MemberStore from './MemberStore';

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
				if(!theme) {
					this.loading = false;
					return;
				}

				// Presentation Settings
				promises.push(this._settingsSubscription(theme.presentationSettings));
				// Organizations
				promises.push(this._orgsSubscription());
				// Members
				promises.push(this._memberThemesSubscription().then(memberThemes => {
					const memberIds = memberThemes.map(memberTheme => memberTheme.member);

					promises.push(this._membersSubscription(memberIds).then(members => {

						// Once all subscriptions are loaded and have returned data, set loading to false
						Promise.all(promises).then(values => {
							this.loading = false;
						});

					}));
				}));

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
					const theme = themeCursor.fetch()[0];
					this.theme = theme ? new ThemeStore(theme, this) : null;

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
						changed: orgs => this.orgs.refreshData(orgs),
						removed: orgs => this.orgs.deleteItem(orgs)
					});

					resolve(toJS(this.orgs));
				}
			});
		});
	}

	// TODO: This is fucked and needs fixing
	_memberThemesSubscription() {
		return new Promise((resolve, reject) => {
	
			const _updateMembers = (memberTheme, remove) => {
				remove = remove || false;
				
				// Refresh data on MemberThemes
				if(!remove) {
					this.memberThemes.refreshData(memberTheme);
				} else {
					this.memberThemes.deleteItem(memberTheme);
				}
				
				// DUPLICATE CODE APPROACHING

				// Handle re-fetch of dependant Members data

				// Stop subscription and observation on Members in order to change query parameters
				if(this.subscriptions.members) this.subscriptions.members.stop();
				if(this.observers.members) this.observers.members.stop();

				// Get list of Member IDs from MemberThemes query
				const memberIds = this.memberThemes.values.map(memberTheme => memberTheme.member);

				// Re-establish the subscription for the Members query
				if(this.subscriptions.members) {
					this.subscriptions.members = Meteor.subscribe('members', memberIds, {
						onReady: () => {
							// Fetch the Members and get the cursor
							const membersCursor = Members.find({ _id: { $in: memberIds }});
							const members = membersCursor.fetch();

							if(this.members) {
								members.forEach(member => this.members.refreshData(member));

								// Re-establish the observer for the Members cursor
								this.observers.members = membersCursor.observe({
									added: member => this.members.refreshData(member),
									changed: member => this.members.refreshData(member)
								});
							}
						}
					});
				}
			};

			// Subscribe to MemberThemes
			this.subscriptions.memberThemes = Meteor.subscribe('memberThemes', this.themeId, {
				onReady: () => {
					// Define the query, save the cursor
					const memberThemesCursor = MemberThemes.find({ theme: this.themeId });
					// Fetch the data
					const memberThemes = memberThemesCursor.fetch();
	
					// Instantiate the collection
					this.memberThemes = new MemberThemesCollection(memberThemes, this, MemberThemeStore);

					// Setup the Meteor observers on the subscription
					this.observers.memberThemes = memberThemesCursor.observe({
						added: memberTheme => _updateMembers(memberTheme),
						changed: memberTheme => _updateMembers(memberTheme),
						removed: memberTheme => _updateMembers(memberTheme, true)
					});

					resolve(toJS(memberThemes));
				}
			});
		});
	}

	_membersSubscription(memberIds) {
		return new Promise((resolve, reject) => {
			// Subscribe to Members
			this.subscriptions.members = Meteor.subscribe('members', memberIds, {
				onReady: () => {
					const membersCursor = Members.find({ _id: { $in: memberIds }});
					const members = membersCursor.fetch();

					this.members = new MembersCollection(members, this, MemberStore);

					this.observers.members = membersCursor.observe({
						added: members => this.members.refreshData(members),
						changed: members => this.members.refreshData(members)
					});

					resolve(toJS(this.members));
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