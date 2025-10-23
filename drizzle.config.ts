import dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";

// Load environment variables from .env.local
dotenv.config({ path: ".env.local" });

export default defineConfig({
	schema: "./lib/db/schemas/index.ts",
	out: "./drizzle/migrations", // Use the migrations folder that matches the database
	dialect: "postgresql",
	dbCredentials: {
		url: process.env.DATABASE_URL!,
	},
});
