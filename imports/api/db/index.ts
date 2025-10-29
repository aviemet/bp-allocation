import { Mongo } from "meteor/mongo"
import "meteor/aldeed:collection2/static"
import { SchemaMap } from "schema-to-types"

import { Images } from "./Images"
import { MemberSchema, membersPermissions } from "./Members"
import { MemberThemeSchema, memberThemesPermissions } from "./MemberThemes"
import { MessageSchema, messagesPermissions } from "./Messages"
import { OrganizationSchema, organizationsPermissions } from "./Organizations"
import { PresentationSettingsSchema, presentationSettingsPermissions } from "./PresentationSettings"
import { ThemeSchema, themesPermissions } from "./Themes"
import { type Member, type MemberTheme, type Message, type Organization, type PresentationSettings, type Theme } from "/imports/types/schema"
import { type TrackableData } from "/imports/api/stores/lib/TrackableStore"

export { MemberSchema, MemberThemeSchema, MessageSchema, OrganizationSchema, PresentationSettingsSchema, ThemeSchema }

export type MemberData = Member & TrackableData
export type MessageData = Message & TrackableData
export type OrgData = Organization & TrackableData
export type SettingsData = PresentationSettings & TrackableData
export type ThemeData = Theme & TrackableData

type PermissionFunction = (userId: string, doc: unknown) => boolean
export interface CollectionPermissions {
	insert: PermissionFunction
	update: PermissionFunction
	remove: PermissionFunction
}

// Define Collections
const Members = new Mongo.Collection<MemberData>("members")
const MemberThemes = new Mongo.Collection<MemberTheme>("memberThemes")
const Messages = new Mongo.Collection<MessageData>("messages")
const Organizations = new Mongo.Collection<OrgData>("organizations")
const PresentationSettingsCollection = new Mongo.Collection<SettingsData>("presentationSettings")
const Themes = new Mongo.Collection<ThemeData>("themes")

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

PresentationSettingsCollection.attachSchema(PresentationSettingsSchema)
PresentationSettingsCollection.allow(presentationSettingsPermissions)

Themes.attachSchema(ThemeSchema)
Themes.allow(themesPermissions)

export { Themes, PresentationSettingsCollection as PresentationSettings, Organizations, Images, Members, MemberThemes, Messages }
