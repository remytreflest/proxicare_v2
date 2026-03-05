'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

import { useUser } from '@auth0/nextjs-auth0/client';

import { fetchUser as apiFetchUser, setApiUserId } from './api';
import type { User, UserRole } from './types';
import { getUserRole } from './utils';

interface AuthContextType {
	user: User | null;
	role: UserRole | null;
	isAuthenticated: boolean;
	isOnboarded: boolean;
	needsRegistration: boolean;
	isLoading: boolean;
	error: string | null;
	userId: string | null;
	refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
	const { user: auth0User, isLoading: auth0Loading, error: auth0Error } = useUser();

	const [backendUser, setBackendUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isOnboarded, setIsOnboarded] = useState(false);
	const [needsRegistration, setNeedsRegistration] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const userId = auth0User?.sub ? (auth0User.sub.split('|')[1] ?? null) : null;

	useEffect(() => {
		setApiUserId(userId);
	}, [userId]);

	const fetchBackendUser = useCallback(async () => {
		if (!userId) {
			setBackendUser(null);
			setIsOnboarded(false);
			setNeedsRegistration(false);
			setIsLoading(false);

			return;
		}

		setIsLoading(true);
		setError(null);

		const { data, error: fetchError } = await apiFetchUser();

		if (fetchError) {
			if (fetchError.status === 404) {
				setNeedsRegistration(true);
			} else {
				setError(fetchError.message);
			}
		} else if (data) {
			setBackendUser(data);
			setNeedsRegistration(false);
			setIsOnboarded(!!data.Patient || !!data.HealthcareProfessional);
		}

		setIsLoading(false);
	}, [userId]);

	useEffect(() => {
		if (auth0Loading) {
			return;
		}

		if (auth0User) {
			fetchBackendUser();
		} else {
			setBackendUser(null);
			setIsOnboarded(false);
			setIsLoading(false);
		}
	}, [auth0User, auth0Loading, fetchBackendUser]);

	const role = backendUser ? getUserRole(backendUser) : null;

	return (
		<AuthContext.Provider
			value={{
				user: backendUser,
				role,
				isAuthenticated: !!auth0User,
				isOnboarded,
				needsRegistration,
				isLoading: auth0Loading || isLoading,
				error: auth0Error?.message ?? error,
				userId,
				refetchUser: fetchBackendUser,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);

	if (context === undefined) {
		throw new Error('useAuth must be used within an AuthProvider');
	}

	return context;
}
