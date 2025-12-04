import { expect } from "chai"
import { Meteor } from "meteor/meteor"
import { type FileData } from "meteor/ostrio:files"
import { ImageMethods } from "/imports/api/methods"
import { Images } from "/imports/api/db"
import { getImageUrl } from "/imports/lib/utils"
import { resetDatabase } from "/imports/test-support/resetDatabase"

describe("Image Methods", function() {
	beforeEach(async function() {
		await resetDatabase()
	})

	describe("remove", function() {
		it("should remove an image by id", async function() {
			const testFile: Pick<FileData, "name" | "extension" | "size" | "type"> = {
				name: "test.jpg",
				extension: "jpg",
				size: 1024,
				type: "image/jpeg",
			}

			const fileId = await Images.collection.insertAsync(testFile)
			expect(await Images.collection.findOneAsync({ _id: fileId })).to.exist

			await ImageMethods.remove.callAsync({ id: fileId })
			expect(await Images.collection.findOneAsync({ _id: fileId })).to.not.exist
		})
	})

	describe("removeMany", function() {
		it("should remove multiple images by ids", async function() {
			const testFiles: Array<Pick<FileData, "name" | "extension" | "size" | "type">> = [
				{ name: "test1.jpg", extension: "jpg", size: 1024, type: "image/jpeg" },
				{ name: "test2.jpg", extension: "jpg", size: 2048, type: "image/jpeg" },
			]

			const fileIds = await Promise.all(
				testFiles.map(file => Images.collection.insertAsync(file))
			)

			for(const fileId of fileIds) {
				expect(await Images.collection.findOneAsync({ _id: fileId })).to.exist
			}

			await ImageMethods.removeMany.callAsync({ ids: fileIds })

			for(const fileId of fileIds) {
				expect(await Images.collection.findOneAsync({ _id: fileId })).to.not.exist
			}
		})
	})
})

describe("getImageUrl utility", function() {
	it("should return empty string for null file object", function() {
		expect(getImageUrl(null)).to.equal("")
		expect(getImageUrl(undefined)).to.equal("")
	})

	it("should return empty string for file object without link method", function() {
		const fileWithoutLink: FileData = {
			name: "test.jpg",
			extension: "jpg",
			size: 1024,
			type: "image/jpeg",
		}
		expect(getImageUrl(fileWithoutLink)).to.equal("")
	})

	it("should return relative URL when link returns relative path", function() {
		const fileObj: FileData = {
			name: "test.jpg",
			extension: "jpg",
			size: 1024,
			type: "image/jpeg",
			link: () => "/uploads/test.jpg",
		}
		const url = getImageUrl(fileObj)
		expect(url).to.include("/uploads/test.jpg")
	})

	it("should return absolute URL when HOST_URL is set", function() {
		const originalHostUrl = Meteor.settings?.HOST_URL
		Meteor.settings = Meteor.settings || {}
		Meteor.settings.HOST_URL = "https://example.com"

		const fileObj: FileData = {
			name: "test.jpg",
			extension: "jpg",
			size: 1024,
			type: "image/jpeg",
			link: () => "/uploads/test.jpg",
		}
		const url = getImageUrl(fileObj)
		expect(url).to.equal("https://example.com/uploads/test.jpg")

		if(originalHostUrl) {
			Meteor.settings.HOST_URL = originalHostUrl
		}
	})

	it("should return absolute URL as-is when already absolute", function() {
		const fileObj: FileData = {
			name: "test.jpg",
			extension: "jpg",
			size: 1024,
			type: "image/jpeg",
			link: () => "https://example.com/uploads/test.jpg",
		}
		const url = getImageUrl(fileObj)
		expect(url).to.equal("https://example.com/uploads/test.jpg")
	})
})
