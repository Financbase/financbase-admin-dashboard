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
			description: 'A comprehensive financial management platform API',
		},
		servers: [
			{
				url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
				description: 'Development server',
			},
		],
	},
	apis: ['./app/api/**/*.ts'], // Path to the API files
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Write to file
const outputPath = path.join(__dirname, '..', 'public', 'openapi.json');
fs.writeFileSync(outputPath, JSON.stringify(swaggerSpec, null, 2));

console.log(`✅ OpenAPI specification generated: ${outputPath}`);
console.log(`📊 Total paths documented: ${Object.keys(swaggerSpec.paths || {}).length}`);
