import type { Request, Response } from 'express';

import { createUser, updateUser } from '../db/queries/users.js';
import { BadRequestError, UserNotAuthenticatedError } from './errors.js';
import { respondWithJSON } from './json.js';
import { hashPassword } from '../auth.js';
import { NewUser } from '../db/schema.js';
import { config } from '../config.js';

export type UserResponse = Omit<NewUser, 'hashedPassword'>;

export async function handlerUsersCreate(req: Request, res: Response) {
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

export async function handlerUsersUpdate(req: Request, res: Response) {
	type parameters = {
		email: string;
		password: string;
	};
	const params: parameters = req.body;

	if (!params.email || !params.password) {
		throw new BadRequestError('Missing required fields');
	}

	const token = req.headers.authorization?.split(' ')[1];
	if (!token) {
		throw new UserNotAuthenticatedError('Missing access token');
	}

	// Verify token and get user ID
	const userId = await verifyToken(token); // Assume verifyToken is a function that verifies the token and returns the user ID

	if (!userId) {
		throw new BadRequestError('Invalid access token');
	}

	// Update user with new email and hashed password
	const hashedPassword = await hashPassword(params.password);
	const updatedUser = await updateUser(userId, {
		email: params.email,
		hashed_password: hashedPassword,
	} satisfies NewUser);

	if (!updatedUser) {
		throw new Error('Could not update user');
	}

	// Return updated user response
	respondWithJSON(res, 200, {
		id: updatedUser.id,
		email: updatedUser.email,
		createdAt: updatedUser.createdAt,
		updatedAt: updatedUser.updatedAt,
	} satisfies UserResponse);
}

export async function verifyToken(token: string): Promise<string> {
	const secret = process.env.JWT_SECRET; // Ensure you have your secret stored in an environment variable
	if (!secret) {
		throw new Error('JWT secret is not defined');
	}

	try {
		const decoded = (await config.jwt.verify(token, secret)) as unknown as {
			sub?: string;
		};
		if (!decoded.sub) {
			throw new UserNotAuthenticatedError('No user id in token');
		}
		return decoded.sub;
	} catch (error) {
		console.error('Token verification failed:', error);
		throw new UserNotAuthenticatedError('Invalid access token');
	}
}
