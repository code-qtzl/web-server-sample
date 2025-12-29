import { eq } from 'drizzle-orm';
import { db } from './index.js';
import { NewUser, users, NewChirp, chirps } from './schema.js';

export async function createUser(user: NewUser) {
	const [result] = await db
		.insert(users)
		.values(user)
		.onConflictDoNothing()
		.returning();
	return result;
}

export async function reset() {
	await db.delete(users);
}

export async function createChirp(chirp: NewChirp) {
	const [result] = await db.insert(chirps).values(chirp).returning();
	return result;
}

export async function getAllChirps() {
	const result = await db.select().from(chirps);
	return result;
}

export async function getChirpById(id: string) {
	const result = await db.select().from(chirps).where(eq(chirps.id, id));
	return result[0];
}
