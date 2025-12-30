import type { Request, Response } from 'express';

import { BadRequestError, UserNotAuthenticatedError } from './errors.js';
import { respondWithJSON } from './json.js';
import { checkPasswordHash } from '../auth.js';
import { getUserByEmail } from '../db/queries/users.js';
import { UserResponse } from './users.js';

export async function createLoginHandler(req: Request, res: Response) {
	type parameters = {
		password: string;
		email: string;
	};

	const params: parameters = req.body;

	const user = await getUserByEmail(params.email);
	if (!user) {
		throw new UserNotAuthenticatedError('invalid username or password');
	}

	const matching = await checkPasswordHash(
		params.password,
		user.hashed_password,
	);
	if (!matching) {
		throw new UserNotAuthenticatedError('invalid username or password');
	}

	respondWithJSON(res, 200, {
		id: user.id,
		email: user.email,
		createdAt: user.createdAt,
		updatedAt: user.updatedAt,
	} satisfies UserResponse);
}
