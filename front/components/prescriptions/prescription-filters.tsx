'use client';

import { Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface PrescriptionFiltersProps {
	statusFilter: string;
	onStatusChange: (status: string) => void;
	searchQuery: string;
	onSearchChange: (query: string) => void;
}

const statuses = [
	{ value: 'all', label: 'Toutes' },
	{ value: 'active', label: 'Actives' },
	{ value: 'completed', label: 'Terminées' },
	{ value: 'expired', label: 'Expirées' },
];

export function PrescriptionFilters({
	statusFilter,
	onStatusChange,
	searchQuery,
	onSearchChange,
}: PrescriptionFiltersProps) {
	return (
		<div className="flex flex-col gap-4 sm:flex-row">
			<div className="relative max-w-md flex-1">
				<Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
				<Input
					placeholder="Rechercher par patient ou acte..."
					value={searchQuery}
					onChange={(event_) => onSearchChange(event_.target.value)}
					className="pl-9"
				/>
			</div>

			<div className="flex flex-wrap gap-2">
				{statuses.map((status) => (
					<Button
						key={status.value}
						variant={statusFilter === status.value ? 'default' : 'outline'}
						size="sm"
						onClick={() => onStatusChange(status.value)}
						className={statusFilter === status.value ? '' : 'bg-transparent'}
					>
						{status.label}
					</Button>
				))}
			</div>
		</div>
	);
}
