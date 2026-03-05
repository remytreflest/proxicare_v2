import { Calendar, FileText, QrCode, Shield } from 'lucide-react';

const features = [
	{
		icon: FileText,
		title: 'Gestion des prescriptions',
		description: 'Créez et suivez vos prescriptions médicales en temps réel',
	},
	{
		icon: Calendar,
		title: 'Planning intelligent',
		description: 'Organisez les rendez-vous avec une vue calendrier intuitive',
	},
	{
		icon: QrCode,
		title: 'Validation QR Code',
		description: 'Validez les actes de soins de manière sécurisée',
	},
	{
		icon: Shield,
		title: 'Sécurité renforcée',
		description: 'Vos données de santé sont protégées et confidentielles',
	},
];

export function LoginFeatures() {
	return (
		<div className="space-y-8">
			<div>
				<h1 className="text-primary-foreground mb-4 text-4xl font-bold text-balance">
					La gestion des soins simplifiée
				</h1>
				<p className="text-primary-foreground/80 text-lg">
					Connectez patients, professionnels et structures de santé sur une plateforme unique.
				</p>
			</div>

			<div className="grid gap-4">
				{features.map((feature) => (
					<div
						key={feature.title}
						className="bg-primary-foreground/10 flex items-start gap-4 rounded-xl p-4 backdrop-blur-sm"
					>
						<div className="bg-primary-foreground/20 rounded-lg p-2">
							<feature.icon className="text-primary-foreground h-5 w-5" />
						</div>

						<div>
							<h3 className="text-primary-foreground font-semibold">{feature.title}</h3>
							<p className="text-primary-foreground/70 text-sm">{feature.description}</p>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
