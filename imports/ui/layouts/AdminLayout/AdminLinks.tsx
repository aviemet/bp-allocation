import { useParams } from "@tanstack/react-router"

import { AdminNavGlobal } from "./AdminNavGlobal"
import { AdminNavLivePresentationSection } from "./AdminNavLivePresentationSection"
import { AdminNavThemeSection } from "./AdminNavThemeSection"

interface AdminLinksProps {
	activeMenuItem: string
}

export const AdminLinks = ({ activeMenuItem }: AdminLinksProps) => {
	const params = useParams({ strict: false })
	const themeId = typeof params.id === "string" ? params.id : null

	return (
		<>
			<AdminNavGlobal activeMenuItem={ activeMenuItem } />
			{ themeId ? <AdminNavThemeSection themeId={ themeId } activeMenuItem={ activeMenuItem } /> : null }
			{ themeId ? <AdminNavLivePresentationSection themeId={ themeId } /> : null }
		</>
	)
}
