import { observable } from 'mobx';

class AppStore {
	defaultMenuHeading = 'Battery Powered Allocation Night Themes!';
	
	// @observable theme;
	@observable sidebarOpen = false;
	@observable menuHeading = this.defaultMenuHeading;
}

export default AppStore;