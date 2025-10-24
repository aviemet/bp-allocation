import { Mongo } from "meteor/mongo"
import { SchemaMap } from "schema-to-types"

import { Images } from "./Images"
import { MemberSchema, membersPermissions } from "./Members"
import { MemberThemeSchema, memberThemesPermissions } from "./MemberThemes"
import { MessageSchema, messagesPermissions } from "./Messages"
import { OrganizationSchema, organizationsPermissions } from "./Organizations"
import { PresentationSettingsSchema, presentationSettingsPermissions } from "./PresentationSettings"
import { ThemeSchema, themesPermissions } from "./Themes"

type PermissionFunction = (userId: string, doc: unknown) => boolean
export interface CollectionPermissions {
	insert: PermissionFunction
	update: PermissionFunction
	remove: PermissionFunction
}

// Define Collections
const Members = new Mongo.Collection("members")
const MemberThemes = new Mongo.Collection("memberThemes")
const Messages = new Mongo.Collection("messages")
const Organizations = new Mongo.Collection("organizations")
const PresentationSettings = new Mongo.Collection("presentationSettings")
const Themes = new Mongo.Collection("themes")

// Collect all schemas for schema-to-types generation
export const schemas: SchemaMap = {
	Member: MemberSchema,
	MemberTheme: MemberThemeSchema,
	Message: MessageSchema,
	Organization: OrganizationSchema,
	PresentationSettings: PresentationSettingsSchema,
	Theme: ThemeSchema,
}

// Attach schemas to collections
Members.attachSchema(MemberSchema)
Members.allow(membersPermissions)

MemberThemes.attachSchema(MemberThemeSchema)
MemberThemes.allow(memberThemesPermissions)

Messages.attachSchema(MessageSchema)
Messages.allow(messagesPermissions)

Organizations.attachSchema(OrganizationSchema)
Organizations.allow(organizationsPermissions)

PresentationSettings.attachSchema(PresentationSettingsSchema)
PresentationSettings.allow(presentationSettingsPermissions)

Themes.attachSchema(ThemeSchema)
Themes.allow(themesPermissions)

export { Themes, PresentationSettings, Organizations, Images, Members, MemberThemes, Messages }

// Re-export generated types
export * from "./generated-types"
