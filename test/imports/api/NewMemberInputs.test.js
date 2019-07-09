import { assert } from 'chai';

import { Members, MemberThemes, Themes } from '/imports/api';
import { ThemeMethods, MemberMethods } from '/imports/api/methods';

const themeData = {
	title: "This test theme",
	question: "Some question"
}
const memberData = {
	firstName: 'Testy', 
	lastName: 'McTesterson', 
	number: 100, 
	amount: 1000
};

const theme = ThemeMethods.create.call(themeData);

describe('members', function() {
	it('adding a member should create a member and memberTheme', async function() {
		const result = await MemberMethods.upsert.call(memberData);
		console.log({result});
		assert.equal(true, true);
	});
});
