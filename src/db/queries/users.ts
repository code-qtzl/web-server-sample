import { eq } from 'drizzle-orm';
import { db } from '../index.js';
import { NewUser, users, NewChirp, chirps } from '../schema.js';
import { checkPasswordHash } from '../../auth.js';

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

export async function getUserByEmail(email: string) {
	const result = await db.select().from(users).where(eq(users.email, email));
	return result[0];
}
