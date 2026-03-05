import { FileQuestion } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function NotFound() {
	return (
		<div className="bg-background flex min-h-screen items-center justify-center p-4">
			<Card className="w-full max-w-md">
				<CardHeader className="text-center">
					<div className="bg-muted mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
						<FileQuestion className="text-muted-foreground h-6 w-6" />
					</div>

					<CardTitle className="text-xl">Page introuvable</CardTitle>
					<CardDescription>La page que vous recherchez n&apos;existe pas ou a été déplacée.</CardDescription>
				</CardHeader>

				<CardContent>
					<Button
						variant="outline"
						className="w-full"
						render={
							<a href="/dashboard" className="w-full">
								Retour au tableau de bord
							</a>
						}
						nativeButton={false}
					/>
				</CardContent>
			</Card>
		</div>
	);
}
