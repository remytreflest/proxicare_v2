jest.mock('@/middlewares/expressjwt.config', () => {
  const checkJwtMock = ((req: any, res: any, next: any) => {
    req.user = { sub: 'auth0|test-user' };
    next();
  }) as any;

  // Fournir une méthode `.unless()` pour le middleware
  checkJwtMock.unless = () => checkJwtMock;

  return {
    __esModule: true,
    default: checkJwtMock
  };
});

jest.mock('@/middlewares/extractUserId', () => {

    const extractUserIdMock = ((req: any, res: any, next: any) => {
      req.userId = 'test-user-id'; // valeur simulée
      next();
    }) as any;

    extractUserIdMock.unless = () => extractUserIdMock;

  return {
    __esModule: true,
    default: extractUserIdMock
  };
});