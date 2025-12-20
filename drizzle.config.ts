import { defineConfig } from 'drizzle-kit';
import env from 'dotenv';
env.config();

export default defineConfig({
	schema: 'src/db/schema.ts',
	out: 'src/db/generated',
	dialect: 'postgresql',
	dbCredentials: {
		url: process.env.DRIZZLE_DB_URL as string,
	},
});
