import { db } from '../index.js';
import { refreshTokens, type NewRefreshToken, users } from '../schema.js';
import { eq, and, isNull, gt } from 'drizzle-orm';

export async function createRefreshToken(userId: string) {
	// Set expiration to 60 days from now
	const expiresAt = new Date();
	expiresAt.setDate(expiresAt.getDate() + 60);

	const newRefreshToken: NewRefreshToken = {
		userId,
		expiresAt,
		revokedAt: null, // null when created
	};

	const [created] = await db
		.insert(refreshTokens)
		.values(newRefreshToken)
		.returning();

	return created;
}

export async function getValidRefreshToken(token: string) {
	const [refreshToken] = await db
		.select()
		.from(refreshTokens)
		.where(
			and(
				eq(refreshTokens.token, token),
				isNull(refreshTokens.revokedAt),
				gt(refreshTokens.expiresAt, new Date()),
			),
		)
		.limit(1);

	return refreshToken;
}

export async function revokeRefreshToken(token: string) {
	const [revoked] = await db
		.update(refreshTokens)
		.set({ revokedAt: new Date() })
		.where(eq(refreshTokens.token, token))
		.returning();

	return revoked;
}

export async function getUserFromRefreshToken(token: string) {
	const result = await db
		.select({
			id: users.id,
			email: users.email,
			hashed_password: users.hashed_password,
			createdAt: users.createdAt,
			updatedAt: users.updatedAt,
		})
		.from(refreshTokens)
		.innerJoin(users, eq(refreshTokens.userId, users.id))
		.where(
			and(
				eq(refreshTokens.token, token),
				isNull(refreshTokens.revokedAt),
				gt(refreshTokens.expiresAt, new Date())
			)
		)
		.limit(1);

	return result[0];
}
