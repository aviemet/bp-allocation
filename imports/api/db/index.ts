import { Mongo } from "meteor/mongo"
import "meteor/aldeed:collection2/static"
import { SchemaMap } from "schema-to-types"

import { Images } from "./Images"
import { LogSchema, logsPermissions } from "./Logs"
import { MemberSchema, membersPermissions } from "./Members"
import { MemberThemeSchema, memberThemesPermissions } from "./MemberThemes"
import { MessageSchema, messagesPermissions } from "./Messages"
import { OrganizationSchema, organizationsPermissions } from "./Organizations"
import { PresentationSettingsSchema, presentationSettingsPermissions } from "./PresentationSettings"
import { type Log, type Member, type MemberTheme, type Message, type Organization, type PresentationSettings, type Theme } from "/imports/types/schema"
import { ThemeSchema, themesPermissions, DEFAULT_NUM_TOP_ORGS } from "./Themes"

export type LogData = Log
export type MemberData = Member
export interface MemberWithTheme extends MemberData {
	theme?: MemberTheme
	[key: string]: unknown
}
export type MessageData = Message
export type OrgData = Organization
export type SettingsData = PresentationSettings
export type ThemeData = Theme

type PermissionFunction = (userId: string, doc: unknown) => boolean
export interface CollectionPermissions {
	insert: PermissionFunction
	update: PermissionFunction
	remove: PermissionFunction
}

// Define Collections
const Logs = new Mongo.Collection<LogData>("logs")
const Members = new Mongo.Collection<MemberWithTheme>("members")
const MemberThemes = new Mongo.Collection<MemberTheme>("memberThemes")
const Messages = new Mongo.Collection<MessageData>("messages")
const Organizations = new Mongo.Collection<OrgData>("organizations")
const PresentationSettingsCollection = new Mongo.Collection<SettingsData>("presentationSettings")
const Themes = new Mongo.Collection<ThemeData>("themes")

// Collect all schemas for schema-to-types generation
export const schemas: SchemaMap = {
	Log: LogSchema,
	Member: MemberSchema,
	MemberTheme: MemberThemeSchema,
	Message: MessageSchema,
	Organization: OrganizationSchema,
	PresentationSettings: PresentationSettingsSchema,
	Theme: ThemeSchema,
}

// Attach schemas to collections
Logs.attachSchema(LogSchema)
Logs.allow(logsPermissions)

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

export {
	Themes, ThemeSchema, DEFAULT_NUM_TOP_ORGS,
	PresentationSettingsCollection as PresentationSettings, PresentationSettingsSchema,
	Organizations, OrganizationSchema,
	Images,
	Logs, LogSchema,
	Members, MemberSchema,
	MemberThemes, MemberThemeSchema,
	Messages, MessageSchema,
}


