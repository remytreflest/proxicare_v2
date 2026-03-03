
import request from 'supertest';
import app from '@/app.test';
import HealthcareProfessional from '@/models/HealthcareProfessional';
import HealthcareAct from '@/models/HealthcareAct';
import HealthcareProfessionalHealthcareAct from '@/models/HealthcareProfessionalHealthcareAct';

jest.mock('@/models/HealthcareProfessional');
jest.mock('@/models/HealthcareAct');
jest.mock('@/models/HealthcareProfessionalHealthcareAct');

describe('Healthcare Controller', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /healthcare/act/healthcareprofessional', () => {
    it('should return 201 when association is successful', async () => {
      (HealthcareProfessional.findOne as jest.Mock).mockResolvedValue({ Id: 1 });
      (HealthcareAct.findOne as jest.Mock).mockResolvedValue({ Id: 2 });
      (HealthcareProfessionalHealthcareAct.create as jest.Mock).mockResolvedValue({});

      const res = await request(app)
        .post('/api/healthcare/act/healthcareprofessional')
        .send({ healthcareActId: 2 })
        .set('userId', 'test-user-id');

      expect(res.statusCode).toBe(201);
    });

    it('should return 400 if required fields are missing', async () => {
      const res = await request(app)
        .post('/api/healthcare/act/healthcareprofessional')
        .send({});

      expect(res.statusCode).toBe(400);
    });

    it('should return 404 if healthcare professional not found', async () => {
      (HealthcareProfessional.findOne as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .post('/api/healthcare/act/healthcareprofessional')
        .send({ healthcareActId: 2 })
        .set('userId', 'test-user-id');

      expect(res.statusCode).toBe(404);
    });

    it('should return 404 if act not found', async () => {
      (HealthcareProfessional.findOne as jest.Mock).mockResolvedValue({ Id: 1 });
      (HealthcareAct.findOne as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .post('/api/healthcare/act/healthcareprofessional')
        .send({ healthcareActId: 999 })
        .set('userId', 'test-user-id');

      expect(res.statusCode).toBe(404);
    });

    it('should return 500 if server error occurs', async () => {
      (HealthcareProfessional.findOne as jest.Mock).mockRejectedValue(new Error());

      const res = await request(app)
        .post('/api/healthcare/act/healthcareprofessional')
        .send({ healthcareActId: 2 })
        .set('userId', 'test-user-id');

      expect(res.statusCode).toBe(500);
    });
  });

  describe('DELETE /healthcare/act/healthcareprofessional/:actId', () => {
    it('should return 200 if deletion is successful', async () => {
      (HealthcareProfessional.findOne as jest.Mock).mockResolvedValue({ Id: 1 });
      (HealthcareProfessionalHealthcareAct.destroy as jest.Mock).mockResolvedValue(1);

      const res = await request(app)
        .delete('/api/healthcare/act/healthcareprofessional/2')
        .set('userId', 'test-user-id');

      expect(res.statusCode).toBe(200);
    });

    it('should return 400 if actId is invalid', async () => {
      const res = await request(app)
        .delete('/api/healthcare/act/healthcareprofessional/invalid')
        .set('userId', 'test-user-id');

      expect(res.statusCode).toBe(400);
    });

    it('should return 404 if healthcare professional not found', async () => {
      (HealthcareProfessional.findOne as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .delete('/api/healthcare/act/healthcareprofessional/2')
        .set('userId', 'test-user-id');

      expect(res.statusCode).toBe(404);
    });

    it('should return 404 if nothing was deleted', async () => {
      (HealthcareProfessional.findOne as jest.Mock).mockResolvedValue({ Id: 1 });
      (HealthcareProfessionalHealthcareAct.destroy as jest.Mock).mockResolvedValue(0);

      const res = await request(app)
        .delete('/api/healthcare/act/healthcareprofessional/2')
        .set('userId', 'test-user-id');

      expect(res.statusCode).toBe(404);
    });

    it('should return 500 if an error occurs', async () => {
      (HealthcareProfessional.findOne as jest.Mock).mockRejectedValue(new Error());

      const res = await request(app)
        .delete('/api/healthcare/act/healthcareprofessional/2')
        .set('userId', 'test-user-id');

      expect(res.statusCode).toBe(500);
    });
  });

  describe('POST /healthcare/act', () => {
    it('should return 201 if act is created', async () => {
      (HealthcareAct.findOne as jest.Mock).mockResolvedValue(null);
      (HealthcareAct.create as jest.Mock).mockResolvedValue({ Name: 'Test', Price: 10 });

      const res = await request(app)
        .post('/api/healthcare/act')
        .send({ name: 'Test', price: 10, description: 'Description' });

      expect(res.statusCode).toBe(201);
    });

    it('should return 400 for missing name or invalid name', async () => {
      const res = await request(app).post('/api/healthcare/act').send({ price: 10 });
      expect(res.statusCode).toBe(400);
    });

    it('should return 400 for invalid price', async () => {
      const res = await request(app).post('/api/healthcare/act').send({ name: 'Test', price: -5 });
      expect(res.statusCode).toBe(400);
    });

    it('should return 409 if act already exists', async () => {
      (HealthcareAct.findOne as jest.Mock).mockResolvedValue({});

      const res = await request(app)
        .post('/api/healthcare/act')
        .send({ name: 'Test', price: 10 });

      expect(res.statusCode).toBe(409);
    });

    it('should return 500 on error', async () => {
      (HealthcareAct.findOne as jest.Mock).mockRejectedValue(new Error());

      const res = await request(app)
        .post('/api/healthcare/act')
        .send({ name: 'Test', price: 10 });

      expect(res.statusCode).toBe(500);
    });
  });

  describe('GET /healthcare/acts', () => {
    it('should return 200 with all acts', async () => {
      (HealthcareAct.findAll as jest.Mock).mockResolvedValue([]);

      const res = await request(app).get('/api/healthcare/acts');
      expect(res.statusCode).toBe(200);
    });

    it('should return 500 on error', async () => {
      (HealthcareAct.findAll as jest.Mock).mockRejectedValue(new Error());

      const res = await request(app).get('/api/healthcare/acts');
      expect(res.statusCode).toBe(500);
    });
  });

  describe('GET /healthcare/acts/user', () => {
    it('should return 200 with associated acts', async () => {
      (HealthcareProfessional.findOne as jest.Mock).mockResolvedValue({ HealthcareActs: [] });

      const res = await request(app)
        .get('/api/healthcare/acts/user')
        .set('userId', 'test-user-id');

      expect(res.statusCode).toBe(200);
    });

    it('should return 404 if professional not found', async () => {
      (HealthcareProfessional.findOne as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .get('/api/healthcare/acts/user')
        .set('userId', 'test-user-id');

      expect(res.statusCode).toBe(404);
    });

    it('should return 500 on error', async () => {
      (HealthcareProfessional.findOne as jest.Mock).mockRejectedValue(new Error());

      const res = await request(app)
        .get('/api/healthcare/acts/user')
        .set('userId', 'test-user-id');

      expect(res.statusCode).toBe(500);
    });
  });

});
