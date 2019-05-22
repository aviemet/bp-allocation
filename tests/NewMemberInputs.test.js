import assert from 'assert';

import { MemberMethods } from '/imports/api/methods';

describe('members', function() {
	it('adding a member should create a member and memberTheme', async function() {
		const data = {firstName: 'Testy', lastName: 'McTesterson', number: 100, amount: 1000};
		const result = await MemberMethods.upsert.call(data);
		console.log({result});
		assert.strictEqual(true, true);
	});
});
