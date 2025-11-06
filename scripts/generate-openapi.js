/**
 * Generate OpenAPI specification from JSDoc comments
 */

const swaggerJsdoc = require('swagger-jsdoc');
const fs = require('fs');
const path = require('path');

const swaggerOptions = {
	definition: {
		openapi: '3.0.0',
		info: {
			title: 'Financbase Admin Dashboard API',
			version: '2.0.0',
			description: 'A comprehensive financial management platform API with advanced automation, integrations, and analytics capabilities.',
			contact: {
				name: 'Financbase Support',
				email: 'support@financbase.com',
			},
			license: {
				name: 'Proprietary',
				url: 'https://financbase.com/license',
			},
		},
		servers: [
			{
				url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
				description: 'Development server',
			},
			{
				url: 'https://app.financbase.com',
				description: 'Production server',
			},
		],
		components: {
			securitySchemes: {
				BearerAuth: {
					type: 'http',
					scheme: 'bearer',
					bearerFormat: 'JWT',
					description: 'Clerk session token obtained from getToken()',
				},
			},
		},
		security: [
			{
				BearerAuth: [],
			},
		],
		tags: [
			{
				name: 'Authentication',
				description: 'Authentication and token validation endpoints',
			},
			{
				name: 'Dashboard',
				description: 'Dashboard metrics and data export',
			},
			{
				name: 'Financial',
				description: 'Financial management - invoices, expenses, transactions',
			},
			{
				name: 'Analytics',
				description: 'Analytics and reporting endpoints',
			},
			{
				name: 'Integrations',
				description: 'Third-party integrations and webhooks',
			},
			{
				name: 'Workflows',
				description: 'Workflow automation and execution',
			},
			{
				name: 'AI',
				description: 'AI-powered features and analysis',
			},
		],
	},
	apis: [
		'./app/api/**/*.ts',
		'./app/api/**/*.js',
	], // Path to the API files
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Ensure output directory exists
const outputDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(outputDir)) {
	fs.mkdirSync(outputDir, { recursive: true });
}

// Write to file
const outputPath = path.join(outputDir, 'openapi.json');
fs.writeFileSync(outputPath, JSON.stringify(swaggerSpec, null, 2));

// Also generate YAML format (optional, for better readability)
const yaml = require('js-yaml');
const yamlPath = path.join(outputDir, 'openapi.yaml');
try {
	fs.writeFileSync(yamlPath, yaml.dump(swaggerSpec));
	console.log(`✅ OpenAPI YAML specification generated: ${yamlPath}`);
} catch (error) {
	console.warn(`⚠️  Could not generate YAML (js-yaml may not be installed): ${error.message}`);
}

const pathCount = Object.keys(swaggerSpec.paths || {}).length;
const operationCount = Object.values(swaggerSpec.paths || {}).reduce((total, pathItem) => {
	return total + Object.keys(pathItem || {}).filter(key => ['get', 'post', 'put', 'patch', 'delete'].includes(key.toLowerCase())).length;
}, 0);

console.log(`✅ OpenAPI specification generated: ${outputPath}`);
console.log(`📊 Total paths documented: ${pathCount}`);
console.log(`📊 Total operations documented: ${operationCount}`);
console.log(`\n📚 To view the API documentation:`);
console.log(`   1. Use Swagger UI: https://editor.swagger.io/`);
console.log(`   2. Import the file: ${outputPath}`);
console.log(`   3. Or use a local Swagger UI server`);
