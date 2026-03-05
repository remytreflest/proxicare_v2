import { Heart } from 'lucide-react';

interface LoginHeaderProps {
	variant?: 'dark' | 'light';
}

export function LoginHeader({ variant = 'light' }: LoginHeaderProps) {
	const textColor = variant === 'light' ? 'text-primary-foreground' : 'text-foreground';
	const iconBg = variant === 'light' ? 'bg-primary-foreground/20' : 'bg-primary/10';
	const iconColor = variant === 'light' ? 'text-primary-foreground' : 'text-primary';

	return (
		<div className="flex items-center gap-3">
			<div className={`${iconBg} rounded-xl p-2`}>
				<Heart className={`h-8 w-8 ${iconColor}`} />
			</div>

			<span className={`text-2xl font-bold ${textColor}`}>Proxicare</span>
		</div>
	);
}
