import { Meteor } from 'meteor/meteor';
import _ from 'lodash';
import { observable, action, autorun, toJS } from 'mobx';
import { Themes, PresentationSettings, Organizations, MemberThemes, Members, Images } from '/imports/api';
import ThemeStore from './ThemeStore';
import OrgsStore from './OrgsStore';
import MemberThemesStore from './MemberThemesStore';
import SettingsStore from './SettingsStore';
import MembersStore from './MembersStore';

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

			let promises = {};

			// Subscriptions to data stores

			// Theme
			promises.theme = this._themeSubscription().then(theme => {
				// Presentation Settings
				promises.settings = this._settingsSubscription(theme.presentationSettings);
				// Organizations
				promises.orgs = this._orgsSubscription();

				promises.members = this._membersSubscription().then(members => {
					// Once all subscriptions are loaded and have returned data, set loading to false
					Promise.allSettled(Object.values(promises)).then(values => {
						this.loading = false;
					});
				});
/*
				// Member Themes
				promises.memberThemes = this._memberThemesSubscription().then(memberThemes => {
					// Members
					promises.members = this._membersSubscription(memberThemes).then(members => console.log({ members }));

					
				});
*/
				this.menuHeading = `Battery Powered Allocation Night: ${theme.title}`;
			});
		} else {
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
					this.theme = new ThemeStore(themeCursor.fetch()[0]);

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
					this.orgs = new OrgsStore(orgsCursor.fetch());

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
							this.members = new MembersStore(membersCombined);
	
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
	/*
	_memberThemesSubscription() {
		return new Promise((resolve, reject) => {

			this.subscriptions.memberThemes = Meteor.subscribe('memberThemes', this.themeId, {
				onReady: () => {
					const memberThemesCursor = MemberThemes.find({ theme: this.themeId });
					// this.memberThemes = new MemberThemesStore(memberThemesCursor.fetch());
					const memberThemes = memberThemesCursor.fetch();

					this.observers.memberThemes = memberThemesCursor.observe({
						added: memberThemes => this.memberThemes.refreshData(memberThemes),
						changed: memberThemes => this.memberThemes.refreshData(memberThemes)
					});

					console.log({ memberThemes });
					resolve(memberThemes);
				}
			});
		});
	}

	_membersSubscription(memberThemes) {
		return new Promise((resolve, reject) => {
			const memberIds = memberThemes.values.map(memberTheme => memberTheme.member);

			this.subscriptions.members = Meteor.subscribe('members', memberIds, {
				onReady: () => {
					const membersCursor = Members.find({ _id: { $in: memberIds }});
					const members = membersCursor.fetch();
					let membersCombined = members.map(member => {
						let memberTheme = _.find(memberThemes, ['member', member._id]);
						// console.log({member, memberTheme});
						return Object.assign({ theme: memberTheme }, member);
					});
					this.members = new MembersStore(membersCombined);

					this.observers.members = membersCursor.observe({
						added: members => this.members.refreshData(members),
						changed: members => this.members.refreshData(members)
					});

					resolve(toJS(this.members));
				}
			});
		});
	}
	*/
	_settingsSubscription(id) {
		return new Promise((resolve, reject) => {

			this.subscriptions.settings = Meteor.subscribe('presentationSettings', id, {
				onReady: () => {
					const settingsCursor = PresentationSettings.find({ _id: id });
					this.settings = new SettingsStore(settingsCursor.fetch()[0]);

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