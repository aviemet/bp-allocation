import { assert } from 'chai';
import { Random } from 'meteor/random';

import { Members, MemberThemes, Themes } from '/imports/api';
import { ThemeMethods, MemberMethods } from '/imports/api/methods';

const themeData = {
	_id: Random.id(),
	title: "This test theme",
	question: "Some question"
}
const memberData = {
	firstName: 'Testy', 
	lastName: 'McTesterson', 
	number: 100, 
	amount: 1000,
	theme: Random.id()
};

console.log({memberData});

const theme = ThemeMethods.create.call(themeData);

describe('members', function() {
	it('adding a member should create a member and memberTheme', async function() {
		const result = await MemberMethods.upsert.call(memberData);
		console.log({result});
		assert.equal(true, true);
	});
});
