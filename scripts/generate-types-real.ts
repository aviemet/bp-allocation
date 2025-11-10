/* eslint-disable no-console */

// Real solution: Parse actual schema files and generate types
// No temporary files, no stale data - either works with real schemas or fails

import * as fs from "fs"
import * as path from "path"

// Parse SimpleSchema from file content
function parseSchemaFromFile(filePath: string): Record<string, string> {
	if(!fs.existsSync(filePath)) {
		throw new Error(`Schema file not found: ${filePath}`)
	}

	const content = fs.readFileSync(filePath, "utf8")
	const schemas: Record<string, string> = {}

	// Find all SimpleSchema definitions (both exported and non-exported)
	const schemaMatches = [...content.matchAll(/(?:export\s+)?const\s+(\w+Schema)\s*=\s*new\s+SimpleSchema\(/g)]

	for(const match of schemaMatches) {
		const schemaName = match[1]
		console.log(`Found schema: ${schemaName} in ${path.basename(filePath)}`)

		// Extract the schema definition by finding the matching closing parenthesis
		const startIndex = content.indexOf(match[0])
		let braceCount = 0
		let endIndex = startIndex
		let inString = false
		let stringChar = ""

		for(let i = startIndex; i < content.length; i++) {
			const char = content[i]
			const prevChar = i > 0 ? content[i - 1] : ""

			if(!inString && (char === '"' || char === "'" || char === "`")) {
				inString = true
				stringChar = char
			} else if(inString && char === stringChar && prevChar !== "\\") {
				inString = false
			} else if(!inString) {
				if(char === "{") {
					braceCount++
				} else if(char === "}") {
					braceCount--
					if(braceCount === 0) {
						endIndex = i
						break
					}
				}
			}
		}

		if(endIndex === startIndex) {
			throw new Error(`Could not parse schema ${schemaName} in ${filePath}`)
		}

		schemas[schemaName] = content.substring(startIndex, endIndex + 1)
	}

	return schemas
}


// Parse schema definition and generate TypeScript interface
function generateInterfaceFromSchema(schemaName: string, schemaContent: string, isCollectionSchema: boolean): string {
	// Extract the schema object definition by finding the content between the first { and matching }
	const startIndex = schemaContent.indexOf("{")
	const endIndex = schemaContent.lastIndexOf("}")

	if(startIndex === -1 || endIndex === -1) {
		throw new Error(`Could not parse schema object for ${schemaName}`)
	}

	const schemaObjectStr = schemaContent.substring(startIndex + 1, endIndex)

	// Parse the schema object using a more robust approach
	// We'll manually parse the JavaScript object structure
	const fields: string[] = []
	let hasExplicitId = false

	// Split by lines and process each field
	const lines = schemaObjectStr.split("\n")
	let i = 0

	// First pass: collect all field definitions and array element types
	const fieldDefinitions: Record<string, { type: string, isOptional: boolean }> = {}
	const arrayElementTypes: Record<string, string> = {}

	while(i < lines.length) {
		const line = lines[i].trim()

		// Skip empty lines and comments
		if(!line || line.startsWith("//")) {
			i++
			continue
		}

		// Look for field definitions
		const fieldMatch = line.match(/^(\w+):\s*(.+?)(?:,|$)/)
		if(fieldMatch) {
			const fieldName = fieldMatch[1]
			const fieldValue = fieldMatch[2].trim()

			// Check if this is an explicit _id field
			if(fieldName === "_id") {
				hasExplicitId = true
			}

			let type = "unknown"
			let isOptional = true

			// Handle simple type definitions (e.g., "amount: Number")
			if(fieldValue === "String") {
				type = "string"
			} else if(fieldValue === "Number") {
				type = "number"
			} else if(fieldValue === "Boolean") {
				type = "boolean"
			} else if(fieldValue === "Date") {
				type = "Date"
			} else if(fieldValue === "Array") {
				type = "unknown[]" // Will be resolved later
			} else if(fieldValue.includes("SchemaRegex.Id")) {
				type = "string"
			} else if(fieldValue.startsWith("{")) {
				// Handle complex field definitions
				let braceCount = 0
				let j = i

				// Find the end of this field definition
				while(j < lines.length) {
					const currentLine = lines[j]

					// Count braces to find the end
					for(const char of currentLine) {
						if(char === "{") braceCount++
						if(char === "}") braceCount--
					}

					if(braceCount === 0) {
						break
					}
					j++
				}

				// Parse the field definition object
				const fieldDefLines = lines.slice(i, j + 1)
				const fieldDef = parseFieldDefinition(fieldDefLines)
				type = fieldDef.type
				isOptional = fieldDef.isOptional

				i = j // Skip to the end of this field
			}

			// _id is always required in MongoDB/Meteor
			if(fieldName === "_id") {
				isOptional = false
			}

			fieldDefinitions[fieldName] = { type, isOptional }
		}

		// Look for array element type definitions (e.g., "chitVotes.$": ChitVoteSchema)
		const arrayElementMatch = line.match(/^"(\w+)\.\$":\s*(\w+Schema)/)
		if(arrayElementMatch) {
			const arrayFieldName = arrayElementMatch[1]
			const elementSchemaName = arrayElementMatch[2]
			const elementTypeName = elementSchemaName.replace("Schema", "")
			arrayElementTypes[arrayFieldName] = elementTypeName
		}

		// Look for array element type definitions using SchemaRegex.Id
		const arrayElementIdMatch = line.match(/^"(\w+)\.\$":\s*SchemaRegex\.Id/)
		if(arrayElementIdMatch) {
			const arrayFieldName = arrayElementIdMatch[1]
			arrayElementTypes[arrayFieldName] = "string"
		}

		i++
	}

	// Second pass: resolve array types and generate fields
	for(const [fieldName, fieldDef] of Object.entries(fieldDefinitions)) {
		let type = fieldDef.type
		let isOptional = fieldDef.isOptional

		// Resolve array element types
		if(type === "unknown[]" && arrayElementTypes[fieldName]) {
			type = `${arrayElementTypes[fieldName]}[]`
		} else if(type === "unknown[]") {
			type = "unknown[]" // Fallback for arrays without element type definition
		}

		// _id is always required in MongoDB/Meteor
		if(fieldName === "_id") {
			isOptional = false
		}

		const optionalMark = isOptional ? "?" : ""
		fields.push(`\t${fieldName}${optionalMark}: ${type}`)
	}

	// Add _id field only if:
	// 1. Not explicitly defined in schema
	// 2. This is a collection-level schema (not an embedded schema)
	const allFields = (hasExplicitId || !isCollectionSchema) ? fields : [`\t_id: string`, ...fields]

	return `export interface ${schemaName.replace("Schema", "")} {\n${allFields.join("\n")}\n}`
}

// Parse a complex field definition object
function parseFieldDefinition(lines: string[]): { type: string, isOptional: boolean } {
	let type = "unknown"
	let isOptional = true

	for(const line of lines) {
		const trimmed = line.trim()

		// Extract type
		if(trimmed.includes("type: String")) {
			type = "string"
		} else if(trimmed.includes("type: Number")) {
			type = "number"
		} else if(trimmed.includes("type: Boolean")) {
			type = "boolean"
		} else if(trimmed.includes("type: Date")) {
			type = "Date"
		} else if(trimmed.includes("type: Array")) {
			type = "unknown[]"
		} else if(trimmed.includes("type: SimpleSchema.Integer")) {
			type = "number"
		} else if(trimmed.includes("SchemaRegex.Id")) {
			type = "string"
		} else if(trimmed.includes("type: ") && trimmed.includes("Schema")) {
			// Handle type: SchemaName pattern
			const schemaMatch = trimmed.match(/type:\s*(\w+Schema)/)
			if(schemaMatch) {
				const schemaName = schemaMatch[1]
				const typeName = schemaName.replace("Schema", "")
				type = typeName
			}
		}

		// Check if required
		if(trimmed.includes("required: true")) {
			isOptional = false
		}

		// Handle enum values
		if(trimmed.includes("allowedValues:")) {
			const enumMatch = trimmed.match(/\[(.*?)\]/)
			if(enumMatch) {
				const values = enumMatch[1].split(",").map(v => v.trim().replace(/['"]/g, ""))
				type = values.map(v => `"${v}"`).join(" | ")
			}
		}
	}

	return { type, isOptional }
}

// Main generation function
export function generateTypes(): void {
	try {
		const schemaFiles = [
			"Members.ts",
			"Themes.ts",
			"Organizations.ts",
			"MemberThemes.ts",
			"Messages.ts",
			"PresentationSettings.ts",
		]

		const allSchemas: Record<string, string> = {}

		// Parse all schema files
		for(const fileName of schemaFiles) {
			const filePath = path.join(process.cwd(), "imports/api/db", fileName)
			const schemas = parseSchemaFromFile(filePath)
			Object.assign(allSchemas, schemas)
		}

		if(Object.keys(allSchemas).length === 0) {
			throw new Error("No schemas found in any of the schema files")
		}

		console.log(`Parsed ${Object.keys(allSchemas).length} schemas from ${schemaFiles.length} files`)

		// Parse index.ts to find which schemas are used for Mongo collections
		const indexPath = path.join(process.cwd(), "imports/api/db/index.ts")
		const indexContent = fs.readFileSync(indexPath, "utf8")
		const collectionSchemas = new Set<string>()

		// Find all .attachSchema() calls and extract the schema name
		const collectionMatches = [...indexContent.matchAll(/\.attachSchema\((\w+)\)/g)]
		for(const match of collectionMatches) {
			collectionSchemas.add(match[1])
			console.log(`Found collection schema: ${match[1]}`)
		}

		// Generate TypeScript interfaces
		let content = `// This file is auto-generated by schema-to-types
// Do not edit manually - run 'npm run generate-types' to regenerate

// Generated types based on SimpleSchema definitions

`

		for(const [schemaName, schemaContent] of Object.entries(allSchemas)) {
			const interfaceName = schemaName.replace("Schema", "")
			const isCollectionSchema = collectionSchemas.has(schemaName)
			const interfaceDef = generateInterfaceFromSchema(interfaceName, schemaContent, isCollectionSchema)
			content += interfaceDef + "\n\n"
		}

		// Write the generated types file to the proper location
		const outputPath = path.join(process.cwd(), "imports/types/schema.ts")
		fs.writeFileSync(outputPath, content)


		console.log("✅ Type generation completed successfully!")
		console.log(`📁 Generated types written to: ${outputPath}`)

	} catch (error) {
		console.error("❌ Type generation failed:", (error as Error).message)
		console.log("\n💡 This means the script could not parse your actual schema files")
		console.log("   Check that your schema files exist and have the correct format")
		process.exit(1)
	}
}

// Only run when explicitly requested (prevents accidental execution during Meteor startup)
if(process.env.GENERATE_TYPES === "1") {
	console.log("Generating TypeScript types from actual SimpleSchema definitions...")
	generateTypes()
}
