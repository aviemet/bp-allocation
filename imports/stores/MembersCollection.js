import TrackableCollection from './TrackableCollection';
import { observable, computed } from 'mobx';
import { filterCollection } from '/imports/lib/utils';

class MembersCollection extends TrackableCollection {
	searchableFields = ['firstName', 'lastName', 'fullName', 'code', 'initials', 'number', 'phone'];
}

export default MembersCollection;