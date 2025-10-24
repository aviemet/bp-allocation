import "meteor/meteor"
import "meteor/accounts-base"
import "meteor/accounts-google"

declare module "meteor/meteor" {
	namespace Meteor {
		interface UserServices {
			google?: {
				email?: string
				name?: string
				picture?: string
				accessToken?: string
				idToken?: string
				expiresAt?: number
				refreshToken?: string
				scope?: string[]
			}
		}

		interface User {
			profile?: {
				name?: string
				firstName?: string
				lastName?: string
				organizationId?: string
			}
			roles?: string[]
			isActive?: boolean
			createdAt?: Date
			updatedAt?: Date
		}
	}
}

declare module "meteor/accounts-base" {
	namespace Accounts {
		function validateNewUser(func: (user: Meteor.User) => boolean): void
	}
}
