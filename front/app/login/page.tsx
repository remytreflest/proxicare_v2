import { redirect } from 'next/navigation';

import { LoginPageContent } from '@/components/auth/login-page-content';
import { auth0 } from '@/lib/auth0';

export default async function LoginPage() {
	const session = await auth0.getSession();

	if (session) {
		redirect('/dashboard');
	}

	return <LoginPageContent />;
}
