import { PatientOnboardingContent } from '@/components/onboarding/patient-onboarding';
import { auth0 } from '@/lib/auth0';
import { serverFetchStructures } from '@/lib/server-api';

export default async function PatientOnboardingPage() {
	const session = await auth0.getSession();

	if (!session) {
		return null;
	}

	const structures = await serverFetchStructures();

	return <PatientOnboardingContent initialStructures={structures} />;
}
