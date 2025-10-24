// @ts-nocheck
const js = require("@eslint/js")
const stylistic = require("@stylistic/eslint-plugin")
const typescriptParser = require("@typescript-eslint/parser")
const importPlugin = require("eslint-plugin-import")
const jsoncPlugin = require("eslint-plugin-jsonc")
const react = require("eslint-plugin-react")
const reactHooks = require("eslint-plugin-react-hooks")
const jsoncParser = require("jsonc-eslint-parser")

const ignores = [
	"public/**/*",
	".vscode/**/*",
	".yarn/**/*",
	".meteor/**/*",
	"node_modules/**/*",
	"client/main.html",
	"client/main.less",
	"client/react-input-range.less",
]

module.exports = [
	js.configs.recommended,
	{
		files: ["**/*.{js,jsx,ts,tsx}"],
		ignores,
		languageOptions: {
			ecmaVersion: "latest",
			sourceType: "module",
			parser: typescriptParser,
			parserOptions: {
				ecmaFeatures: {
					jsx: true,
				},
			},
			globals: {
				Meteor: "readonly",
				Package: "readonly",
				Npm: "readonly",
				console: "readonly",
				process: "readonly",
				global: "readonly",
				Buffer: "readonly",
				__dirname: "readonly",
				__filename: "readonly",
				module: "readonly",
				require: "readonly",
				exports: "readonly",
				describe: "readonly",
				it: "readonly",
				before: "readonly",
				after: "readonly",
				beforeEach: "readonly",
				afterEach: "readonly",
			},
		},
		settings: {
			react: {
				version: "detect",
			},
			"import/resolver": {
				node: {
					extensions: [".js", ".jsx", ".ts", ".tsx"]
				}
			},
		},
		plugins: {
			"react": react,
			"react-hooks": reactHooks,
			"@stylistic": stylistic,
			"import": importPlugin,
		},
		rules: {
			"@stylistic/indent": ["error", "tab", {
				SwitchCase: 1,
				VariableDeclarator: "first",
				MemberExpression: 1,
				ArrayExpression: 1,
				ignoredNodes: [
					"TSTypeParameterInstantiation",
					"TemplateLiteral",
					"TemplateElement",
					"JSXExpressionContainer > TemplateLiteral",
					"JSXExpressionContainer > TemplateElement",
				],
			}],
			"@stylistic/brace-style": ["error", "1tbs", {
				allowSingleLine: true,
			}],
			"@stylistic/object-curly-spacing": ["error", "always", {
				objectsInObjects: true,
			}],
			"@stylistic/jsx-curly-spacing": ["error", {
				when: "always",
				children: true,
			}],
			"@stylistic/member-delimiter-style": ["error", {
				multiline: {
					delimiter: "none",
				},
				singleline: {
					delimiter: "comma",
				},
				multilineDetection: "brackets",
			}],
			"@stylistic/jsx-one-expression-per-line": "off",
			"@stylistic/keyword-spacing": ["error", {
				after: true,
				before: true,
				overrides: {
					if: { after: false },
					for: { after: false },
					while: { after: false },
					switch: { after: false },
					catch: { after: false },
				},
			}],
			"@stylistic/comma-dangle": ["error", {
				arrays: "always-multiline",
				objects: "always-multiline",
				imports: "always-multiline",
				exports: "always-multiline",
				functions: "only-multiline",
			}],
			"@stylistic/multiline-ternary": ["error", "always-multiline"],
			"@stylistic/space-before-function-paren": ["error", "never"],
			"@stylistic/arrow-spacing": "error",
			"@stylistic/space-before-blocks": ["error", "always"],
			"@stylistic/no-multiple-empty-lines": ["error", {
				max: 2,
				maxBOF: 0,
			}],
			"@stylistic/space-infix-ops": "error",
			"@stylistic/space-unary-ops": ["error", {
				words: true,
				nonwords: false,
				overrides: {
					"!": false,
					"!!": false,
					"+": false,
					"-": false,
				},
			}],
			"@stylistic/comma-spacing": ["error", {
				before: false,
				after: true,
			}],
			"@stylistic/no-multi-spaces": "error",
			"@stylistic/spaced-comment": ["error", "always", {
				"line": {
					"markers": ["/"],
					"exceptions": ["-", "+"],
				},
				"block": {
					"markers": ["!"],
					"exceptions": ["*"],
					"balanced": true,
				},
			}],
			"no-trailing-spaces": ["error", {
				skipBlankLines: false,
				ignoreComments: false,
			}],
			"no-unused-vars": ["warn", {
				vars: "all",
				args: "none",
				caughtErrorsIgnorePattern: "^_",
				destructuredArrayIgnorePattern: "^_",
				ignoreRestSiblings: true,
				varsIgnorePattern: "^React$"
			}],
			"eqeqeq": "error",
			"no-console": "warn",
			"eol-last": ["error", "always"],
			"import/order": ["error", {
				"groups": [
					"builtin",
					"external",
					"internal",
					["parent", "sibling"],
					"index",
					"object",
				],
				"alphabetize": {
					"order": "asc",
					"caseInsensitive": true,
				},
				"newlines-between": "always",
			}],
			"import/newline-after-import": "error",
			"import/consistent-type-specifier-style": ["error", "prefer-inline"],
			"import/no-named-as-default": "off",
			"import/no-unused-modules": ["error", {
				"unusedExports": true,
				"ignoreExports": ["**/react"]
			}],
			"semi": ["error", "never"],
			"@stylistic/quotes": ["error", "double", {
				avoidEscape: true,
				allowTemplateLiterals: "always",
			}],
			"@stylistic/jsx-quotes": ["error", "prefer-double"],
			...reactHooks.configs.recommended.rules,
		},
	},
	// Typescript declaration files
	{
		files: ["**/*.d.ts"],
		ignores,
		rules: {
			"no-unused-vars": "off",
			"@typescript-eslint/member-delimiter-style": "off",
			"@stylistic/ts/indent": "off",
		},
	},
	// JSON files
	{
		files: ["**/*.json", "**/*.jsonc", "**/*.json5"],
		language: "json/json",
		ignores,
		plugins: {
			jsonc: jsoncPlugin,
		},
		languageOptions: {
			parser: jsoncParser,
		},
		rules: {
			"json/no-duplicate-keys": "error",
			"jsonc/indent": ["error", 2, { ignoredNodes: ["Property"] }],
			"@stylistic/no-multi-spaces": "off",
		},
	},
	// Test files
	{
		files: ["**/*.test.{js,jsx,ts,tsx}", "**/tests/**/*"],
		rules: {
			"@typescript-eslint/no-explicit-any": "off",
		},
	},
]
