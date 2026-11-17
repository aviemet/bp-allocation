export function isAdminShellPath(pathname: string): boolean {
	const normalized = pathname.replace(/\/$/, "") || "/"
	return normalized === "/admin" || normalized.startsWith("/admin/")
}

export function isLivePresentationPath(pathname: string): boolean {
	return /^\/admin\/[^/]+\/presentation\/?$/.test(pathname)
}

export function deriveActiveMenuItem(pathname: string): string {
	const normalized = pathname.replace(/\/$/, "") || "/"
	if(normalized === "/admin") {
		return "themes"
	}

	const match = normalized.match(/^\/admin\/[^/]+\/([^/]+)/)
	if(!match) {
		return ""
	}

	const segment = match[1]
	if(segment === "presentation") {
		return "presentation"
	}
	if(segment === "settings") {
		return "settings"
	}
	return segment
}
