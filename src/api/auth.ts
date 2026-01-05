import type { Request, Response } from 'express';

import { UserNotAuthenticatedError } from './errors.js';
import { respondWithJSON } from './json.js';
import { checkPasswordHash, makeJWT, makeRefreshToken } from '../auth.js';
import { getUserByEmail } from '../db/queries/users.js';
import { createRefreshToken } from '../db/queries/refreshTokens.js';
import { UserResponse } from './users.js';
import { config } from '../config.js';
import { randomBytes } from 'crypto';

type LoginResponse = UserResponse & {
	token: string;
	refreshToken: string;
};

export async function createLoginHandler(req: Request, res: Response) {
	type parameters = {
		password: string;
		email: string;
	};

	const params: parameters = req.body;

	const user = await getUserByEmail(params.email);
	console.log(
		`Login attempt for email=${params.email} user_found=${Boolean(
			user,
		)} user_id=${user?.id ?? 'none'}`,
	);
	if (!user) {
		throw new UserNotAuthenticatedError('invalid username or password');
	}

	const matching = await checkPasswordHash(
		params.password,
		user.hashed_password,
	);
	console.log(
		`Password provided=${
			params.password ? 'yes' : 'no'
		} password_match=${matching}`,
	);
	if (!matching) {
		throw new UserNotAuthenticatedError('invalid username or password');
	}

	// Create access token with 1 hour expiration
	const accessToken = makeJWT(
		user.id,
		config.jwt.defaultDuration,
		config.jwt.secret,
	);

	// Create refresh token string and persist it in the database with 60 day expiration
	let refreshToken;
	try {
		const tokenStr = makeRefreshToken();
		console.log(`Creating refresh token for user ${user.id}`);
		refreshToken = await createRefreshToken(user.id, tokenStr);
		console.log('Created refresh token:', refreshToken);
	} catch (err: any) {
		console.log('Error creating refresh token:', err?.message ?? err);
		throw new Error('failed to create refresh token');
	}

	if (!refreshToken || !refreshToken.token) {
		console.log(
			'Refresh token creation returned invalid value:',
			refreshToken,
		);
		throw new Error('failed to create refresh token');
	}

	respondWithJSON(res, 200, {
		id: user.id,
		email: user.email,
		createdAt: user.createdAt,
		updatedAt: user.updatedAt,
		token: accessToken,
		refreshToken: refreshToken.token,
	} satisfies LoginResponse);
}
