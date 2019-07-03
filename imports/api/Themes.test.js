import assert from 'assert';
import { ThemeMethods } from '/imports/api/methods';

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
	describe("Creating a record", function() {

		it("Should return an _id when succesful", async function() {
			let theme = ThemeMethods.create.call(themeData);
			assert.notEqual(theme, null);
		});
		
		it("Should fail without the required fields", async function() {
			let theme = ThemeMethods.create.call();
			assert.equal(theme, null);
		});

	});
});