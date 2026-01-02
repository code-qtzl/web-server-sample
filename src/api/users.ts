import type { Request, Response } from 'express';

import { createUser } from '../db/queries/users.js';
import { BadRequestError } from './errors.js';
import { respondWithJSON } from './json.js';
import { hashPassword } from '../auth.js';
import { NewUser } from '../db/schema.js';

export type UserResponse = Omit<NewUser, 'hashedPassword'>;

export async function createUsersHandler(req: Request, res: Response) {
	type parameters = {
		email: string;
		password: string;
		expiresInSeconds?: number;
	};
	const params: parameters = req.body;

	if (!params.email || !params.password) {
		throw new BadRequestError('Missing required fields');
	}

	const hashedPassword = await hashPassword(params.password);
	const user = await createUser({
		email: params.email,
		hashed_password: hashedPassword,
	} satisfies NewUser);

	if (!user) {
		throw new Error('Could not create user');
	}

	respondWithJSON(res, 201, {
		id: user.id,
		email: user.email,
		createdAt: user.createdAt,
		updatedAt: user.updatedAt,
	} satisfies UserResponse);
}
