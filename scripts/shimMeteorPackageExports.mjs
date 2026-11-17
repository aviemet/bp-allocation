import fs from "node:fs"
import path from "node:path"
import { createRequire } from "node:module"

const require = createRequire(import.meta.url)

const shims = [
	{ packageName: "seroval-plugins", subpath: "web", target: "dist/web.js" },
	{ packageName: "seroval", subpath: "shared", target: "dist/shared.js" },
	{ packageName: "seroval", subpath: "validator", target: "dist/validator.js" },
]

for(const shim of shims) {
	let packageJsonPath
	try {
		packageJsonPath = require.resolve(`${shim.packageName}/package.json`)
	} catch {
		continue
	}

	const packageDirectory = path.dirname(packageJsonPath)
	const targetPath = path.join(packageDirectory, shim.target)
	if(!fs.existsSync(targetPath)) {
		throw new Error(`Missing shim target for ${shim.packageName}/${shim.subpath}: ${targetPath}`)
	}

	const shimPath = path.join(packageDirectory, `${shim.subpath}.js`)
	fs.writeFileSync(shimPath, `export * from "./${shim.target}";\n`)
}
