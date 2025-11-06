import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";
import globals from "globals";

export default [
	js.configs.recommended,
	{
		ignores: [
			"node_modules/**",
			".next/**",
			"dist/**",
			"build/**",
			"coverage/**",
			"*.config.js",
			"*.config.mjs",
			"*.d.ts",
		],
	},
	{
		files: ["**/*.js", "**/*.jsx", "**/*.ts", "**/*.tsx"],
		languageOptions: {
			ecmaVersion: "latest",
			sourceType: "module",
			globals: {
				...globals.node,
				...globals.browser,
			},
		},
		rules: {
			"no-unused-vars": "warn",
			"no-console": "warn",
		},
	},
	{
		files: ["**/*.ts", "**/*.tsx"],
		languageOptions: {
			parser: tsparser,
			parserOptions: {
				project: "./tsconfig.json",
			},
			globals: {
				...globals.node,
				...globals.browser,
			},
		},
		plugins: {
			"@typescript-eslint": tseslint,
		},
		rules: {
			...tseslint.configs.recommended.rules,
			"@typescript-eslint/no-unused-vars": [
				"warn",
				{
					argsIgnorePattern: "^_",
					varsIgnorePattern: "^_",
				},
			],
			"@typescript-eslint/no-explicit-any": "warn",
			"@typescript-eslint/no-empty-object-type": "warn",
		},
	},
];
