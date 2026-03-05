import { Loader2 } from 'lucide-react';

export default function DashboardLoading() {
	return (
		<div className="flex min-h-[60vh] items-center justify-center">
			<div className="text-center">
				<Loader2 className="text-primary mx-auto mb-4 h-8 w-8 animate-spin" />
				<p className="text-muted-foreground text-sm">Chargement...</p>
			</div>
		</div>
	);
}
