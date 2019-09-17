import TrackableCollection from './TrackableCollection';
import { observable, computed, action } from 'mobx';

class MembersStore extends TrackableCollection {
	@observable working = true;
}

export default MembersStore;