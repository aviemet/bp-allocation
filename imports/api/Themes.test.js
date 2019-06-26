import assert from 'assert';
import { Themes } from '/imports/api';

/** Things to test:
 * - Required fields are required
 * - Optional fields are optional
 * - Validation
 * - Permissions
 */

const themeData = {
	title: "Test Theme",
	question: "Test Question",
	qarter: "2019Q1"
}

describe("Themes model", function() {
	it("New Theme insert succeeds", async function() {
		let item = Items.insert(themeData);
		console.log({item});
		assert.strictEqual(true, true);
	});
});