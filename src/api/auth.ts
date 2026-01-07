import type { Request, Response } from 'express';

import { UserNotAuthenticatedError } from './errors.js';
import { respondWithJSON } from './json.js';
import {
	checkPasswordHash,
	getBearerToken,
	makeJWT,
	makeRefreshToken,
} from '../auth.js';
import { getUserByEmail } from '../db/queries/users.js';
import {
	revokeRefreshToken,
	saveRefreshToken,
	userForRefreshToken,
} from '../db/queries/refreshTokens.js';
import { UserResponse } from './users.js';
import { config } from '../config.js';

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
	const refreshToken = makeRefreshToken();

	const saved = await saveRefreshToken(user.id, refreshToken);
	if (!saved) {
		throw new UserNotAuthenticatedError('could not save refresh token');
	}

	respondWithJSON(res, 200, {
		id: user.id,
		email: user.email,
		createdAt: user.createdAt,
		updatedAt: user.updatedAt,
		token: accessToken,
		refreshToken: refreshToken,
	} satisfies LoginResponse);
}

// found in api/refresh.ts and api/revoke.ts
// export async function handlerRefresh(req: Request, res: Response) {
// 	let refreshToken = getBearerToken(req);

// 	const result = await userForRefreshToken(refreshToken);
// 	if (!result) {
// 		throw new UserNotAuthenticatedError('invalid refresh token');
// 	}

// 	const user = result.user;
// 	const accessToken = makeJWT(
// 		user.id,
// 		config.jwt.defaultDuration,
// 		config.jwt.secret,
// 	);

// 	type response = {
// 		token: string;
// 	};

// 	respondWithJSON(res, 200, {
// 		token: accessToken,
// 	} satisfies response);
// }

// export async function handlerRevoke(req: Request, res: Response) {
// 	const refreshToken = getBearerToken(req);
// 	await revokeRefreshToken(refreshToken);
// 	res.status(204).send();
// }
