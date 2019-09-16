import { Meteor } from 'meteor/meteor';
import _ from 'lodash';
import { observable, action, autorun, toJS } from 'mobx';
import ReactiveDataManager from './ReactiveDataManager';
import { Themes, PresentationSettings, Organizations, MemberThemes, Members, Images } from '/imports/api';
import ThemeStore from './ThemeStore';
import { ThemeMethods, PresentationSettingsMethods } from '/imports/api/methods';

class DataStore {
	@observable themeId;

	@observable loading;

	theme;
	settings;
	orgs;
	memberThemes;
	members;
	images;

	subscriptions = {};
	observers = {};

	constructor() {
		this.dataManager = new ReactiveDataManager(this);
	}

	@action
	updateTheme(field, value) {
		if(!_.isEmpty(value)) {
			let data = {};
			data['field'] = value;
			ThemeMethods.update.call({
				id: this.themeId,
				data
			});
		}
	}

	@action
	updateSettings(newSettings) {
		this.settings = newSettings;
	}

	loadData = autorun(() => {
		if(this.themeId) {
			// Stop the subscriptions and observers which are about to be replaced
			Object.values(this.subscriptions).forEach(subscription => subscription.stop());
			Object.values(this.observers).forEach(observer => observer.stop());

			
			this.subscriptions.theme = Meteor.subscribe('themes', this.themeId, {
				onReady: () => {
					const cursor = Themes.find({ _id: this.themeId });
					this.theme = new ThemeStore(cursor.fetch()[0]);

					this.observers.theme = cursor.observe({
						added: theme => {
							this.theme.refreshTheme(theme);
						},
						changed: theme => {
							this.theme.refreshTheme(theme);
						}
					});
				}
			});
		}
	});

}

export default DataStore;