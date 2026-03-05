import { ProfessionalOnboardingContent } from '@/components/onboarding/professional-onboarding';
import { auth0 } from '@/lib/auth0';
import { serverFetchHealthcareActs, serverFetchStructures } from '@/lib/server-api';

export default async function ProfessionalOnboardingPage() {
	const session = await auth0.getSession();

	if (!session) {
		return null;
	}

	const [structures, careActs] = await Promise.all([serverFetchStructures(), serverFetchHealthcareActs()]);

	return <ProfessionalOnboardingContent initialStructures={structures} initialCareActs={careActs} />;
}
