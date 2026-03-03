export function serverError(res: any, error: unknown): any {
  if (process.env.DEBUG === 'true') {
    const message = error instanceof Error ? error.message : String(error);
    return res.status(500).json({ message });
  }
  return res.status(500).json({ message: 'Erreur interne du serveur.' });
}
