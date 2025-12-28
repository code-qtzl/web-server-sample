import type { MigrationConfig } from 'drizzle-orm/migrator';

type Config = {
	api: APIConfig;
	db: DBConfig;
};

type APIConfig = {
	fileServerHits: number;
	port: number;
	platform: string;
};

type DBConfig = {
	url: string;
	migrationConfig: MigrationConfig;
};

process.loadEnvFile();

function envOrThrow(key: string) {
	const value = process.env[key];
	if (!value) {
		throw new Error(`Environment variable ${key} is not set`);
	}
	return value;
}

const migrationConfig: MigrationConfig = {
	migrationsFolder: './src/db/generated',
};

export const config: Config = {
	db: {
		url: envOrThrow('DB_URL'),
		migrationConfig: migrationConfig,
	},
	api: {
		fileServerHits: 0,
		port: Number(envOrThrow('PORT')),
		platform: envOrThrow('PLATFORM'),
	},
};
