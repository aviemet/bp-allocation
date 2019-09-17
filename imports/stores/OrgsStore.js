import TrackableCollection from './TrackableCollection';
import { observable, computed, action } from 'mobx';

class OrgsStore extends TrackableCollection {
	@observable working = true;
}

export default OrgsStore;