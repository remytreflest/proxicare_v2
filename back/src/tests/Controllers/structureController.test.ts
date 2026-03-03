import request from 'supertest';
import app from '@/app.test';
import { Structure } from '@/models/Structure';

jest.mock('@/models/Structure');

describe('Structure Controller', () => {

  describe('GET /structures', () => {
    const mockStructures = [
      { id: 1, name: 'Clinique Saint Michel' },
      { id: 2, name: 'Hôpital Central' }
    ];

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return 200 and list of structures', async () => {
      (Structure.findAll as jest.Mock).mockResolvedValue(mockStructures);

      const res = await request(app).get('/api/structures');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(mockStructures);
    });

    it('should return 500 if database throws an error', async () => {
      (Structure.findAll as jest.Mock).mockRejectedValue(new Error('DB Error'));

      const res = await request(app).get('/api/structures');

      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({ message: 'Erreur interne du serveur.' });
    });
  });

});
