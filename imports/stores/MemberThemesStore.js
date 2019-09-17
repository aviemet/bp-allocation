import TrackableCollection from './TrackableCollection';
import { observable, computed, action } from 'mobx';

class MemberThemesStore extends TrackableCollection {
	@observable working = true;
}

export default MemberThemesStore;