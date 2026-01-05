import { db } from '../index.js';
import { refreshTokens, type NewRefreshToken, users } from '../schema.js';
import { eq, and, isNull, gt } from 'drizzle-orm';

export async function createRefreshToken(userId: string, token: string) {
	// Set expiration to 60 days from now
	const expiresAt = new Date();
	expiresAt.setDate(expiresAt.getDate() + 60);

	// Ensure revokedAt is explicitly set to null when creating a new token
	const newRefreshToken: NewRefreshToken = {
		token,
		userId,
		expiresAt,
		revokedAt: null,
	};

	let created;
	console.log('Inserting refresh token', newRefreshToken);
	try {
		[created] = await db
			.insert(refreshTokens)
			.values(newRefreshToken)
			.returning();
	} catch (err: any) {
		console.error(`Error creating refresh token for user ${userId}:`, err);
		// If the PG error has detailed fields, log them for debugging
		if (err?.code || err?.detail || err?.hint) {
			console.error('PG error details:', {
				code: err.code,
				detail: err.detail,
				hint: err.hint,
			});
		}
		throw new Error('failed to create refresh token');
	}

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
	const now = new Date();
	const [revoked] = await db
		.update(refreshTokens)
		.set({ revokedAt: now, updatedAt: now })
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
				gt(refreshTokens.expiresAt, new Date()),
			),
		)
		.limit(1);

	return result[0];
}
