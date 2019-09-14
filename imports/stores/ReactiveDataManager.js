import { Meteor } from 'meteor/meteor';
import { autorun, toJS } from 'mobx';
import { Themes, PresentationSettings, Organizations, MemberThemes, Members, Images } from '/imports/api';


// A class for managing Meteor subscriptions based on observed changes in a state store
export default class ReactiveDataManager {
	// state - a Mobx store instance
	constructor(state) {
		console.log({ state });
		this.subscriptions = {};
		this.observers = {};

		let themeDataManager = autorun(() => {
			console.log('data manager autorun');

			let refreshTheme = state => {
				let newTheme = Themes.find({ _id: state.themeId }).fetch()[0];
				console.log({ newTheme });
				state.updateTheme(newTheme);
			};

			if(this.subscriptions.theme) this.subscriptions.theme.stop();
			if(this.observers.theme) this.observers.theme.stop();

			this.subscriptions.theme = Meteor.subscribe('theme', state.themeId, {
				onReady: () => {
					console.log({ empty: !!state.theme });
					this.observers.theme = Themes.find({ _id: state.themeId }).observe({
						added: () => {
							console.log('added');
							refreshTheme(state);
						},
						changed: () => {
							console.log('changed');
							refreshTheme(state);
						}
					});
				}
			});
		});
/*
		// a Mobx autorun function for fetching data
		let examplesDataManager = autorun(() => {
			// reusable method for updating the state store with fresh data
			let refreshExamples = (state) => {
				let refreshedExamples = Examples.find().fetch();
				state.updateExamples(refreshedExamples);
			};

			// If a current subscription exists, it is now invalidated by the mobx autorun, so stop it
			if (this.examplesSubscription) {
				this.examplesSubscription.stop();
			}
			// same with the observer for the subscription
			if (this.examplesObserver) {
				this.examplesObserver.stop();
			}

			// create a new Meteor subscription
			state.setExamplesLoading (true);
			this.examplesSubscription = Meteor.subscribe("examples", {
				// callback when the Meteor subscription is ready
				onReady: () => {
					// create a Meteor observer to watch the subscription for changes and update data when they occur
					this.examplesObserver = Examples.find().observe({
						added: () => {
							refreshExamples(state);
						},
						changed: () => {
							refreshExamples(state);
						}
					});
					state.setExamplesLoading(false);
				}
			});
		});

		let dependentsDataManager = autorun(() => {
			let dependentFilter = toJS(state.dependentFilter);

			// reusable method for updating the state store with fresh data
			let refreshDependents = (state) => {
				let refreshedDependents = Dependents.find().fetch();
				state.updateDependents(refreshedDependents);
			};

			// If a current subscription exists, it is now invalidated by the mobx autorun, so stop it
			if (this.dependentsSubscription) {
				this.dependentsSubscription.stop();
			}
			// same with the observer for the subscription
			if (this.dependentsObserver) {
				this.dependentsObserver.stop();
			}

			// create a new Meteor subscription, but only if there are some filter values
			if (dependentFilter.length > 0) {
				this.dependentsSubscription = Meteor.subscribe("dependents", dependentFilter, {
					// callback when the Meteor subscription is ready
					onReady: () => {
						// create a Meteor observer to watch the subscription for changes and update data when they occur
						this.dependentsObserver = Dependents.find().observe({
							added: () =>{
								refreshDependents(state);
							},
							changed: () => {
								refreshDependents(state);
							}
						});
					}
				});
			}
		});*/
	}
}