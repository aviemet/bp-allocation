import { Meteor } from 'meteor/meteor';
import _ from 'lodash';
import { observable, action, autorun, toJS } from 'mobx';
import ReactiveDataManager from './ReactiveDataManager';
import { Themes, PresentationSettings, Organizations, MemberThemes, Members, Images } from '/imports/api';

import { ThemeMethods, PresentationSettingsMethods } from '/imports/api/methods';

class DataStore {
	@observable themeId;

	@observable loading;

	@observable theme;
	@observable	settings;
	@observable orgs;
	@observable memberThemes;
	@observable members;
	@observable images;

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
		console.log('autorun');
		if(this.themeId) {
			this.subscriptions.theme = Meteor.subscribe('themes', this.themeId, {
				onReady: () => {
					const cursor = Themes.find({ _id: this.themeId });
					this.theme = cursor.fetch()[0];
					this.observers.theme = cursor.observe({
						added: theme => {
							this.theme = theme;
						},
						changed: theme => {
							this.theme = theme;
						}
					});
				}
			});
		}
	});

}

export default DataStore;