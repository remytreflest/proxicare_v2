import request from 'supertest';
import app from '@/app.test';
import { User } from '@/models/User';
import Patient from '@/models/Patient';
import HealthcareProfessional from '@/models/HealthcareProfessional';
import { Structure } from '@/models/Structure';
import { SpecialityEnum } from '@/resources/emuns/speciality';
import { RolesEnum } from '@/resources/emuns/rolesEnum';
import { addUserRole } from '@/resources/helpers/userHelper';

jest.mock('@/models/User');
jest.mock('@/models/Patient');
jest.mock('@/models/HealthcareProfessional');
jest.mock('@/models/Structure');
jest.mock('@/resources/helpers/userHelper');

describe('Register Controller', () => {
  describe('GET /user', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return 200 with user and related data', async () => {
      const mockUser = { id: '1' };
      (User.findByPk as jest.Mock).mockResolvedValue(mockUser);

      const res = await request(app).get('/api/user');
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(mockUser);
    });

    it('should return 404 if user not found', async () => {
      (User.findByPk as jest.Mock).mockResolvedValue(null);
      const res = await request(app).get('/api/user');
      expect(res.statusCode).toBe(404);
    });

    it('should return 500 on DB error', async () => {
      (User.findByPk as jest.Mock).mockRejectedValue(new Error('DB Error'));
      const res = await request(app).get('/api/user');
      expect(res.statusCode).toBe(500);
    });
  });

  describe('POST /register/user', () => {
    const newUser = {
      id: '123',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com'
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return 201 when user created', async () => {
      (User.findOne as jest.Mock).mockResolvedValueOnce(null).mockResolvedValueOnce(null);
      (User.create as jest.Mock).mockResolvedValue(newUser);

      const res = await request(app).post('/api/register/user').send(newUser);
      expect(res.statusCode).toBe(201);
      expect(res.body).toEqual(newUser);
    });

    it('should return 400 if missing fields', async () => {
      const res = await request(app).post('/api/register/user').send({ email: 'missing@x.com' });
      expect(res.statusCode).toBe(400);
    });

    it('should return 409 if user ID exists', async () => {
      (User.findOne as jest.Mock).mockResolvedValueOnce({ id: '123' });

      const res = await request(app).post('/api/register/user').send(newUser);
      expect(res.statusCode).toBe(409);
    });

    it('should return 409 if email exists', async () => {
      (User.findOne as jest.Mock).mockResolvedValueOnce(null).mockResolvedValueOnce({ id: '124' });

      const res = await request(app).post('/api/register/user').send(newUser);
      expect(res.statusCode).toBe(409);
    });

    it('should return 500 on error', async () => {
      (User.findOne as jest.Mock).mockRejectedValue(new Error('DB error'));

      const res = await request(app).post('/api/register/user').send(newUser);
      expect(res.statusCode).toBe(500);
    });
  });

  describe('POST /register/patient', () => {
    const patientData = {
      birthday: '1991-01-01',
      gender: 'M',
      address: '1 rue test',
      socialSecurityNumber: '123456789123456',
      structureId: 1
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return 201 when patient created', async () => {
      (User.findByPk as jest.Mock).mockResolvedValue({ id: '1' });
      (Patient.findOne as jest.Mock).mockResolvedValue(null);
      (Patient.create as jest.Mock).mockResolvedValue(patientData);

      const res = await request(app).post('/api/register/patient').send(patientData);
      expect(res.statusCode).toBe(201);
    });

    it('should return 400 if missing fields', async () => {
      const res = await request(app).post('/api/register/patient').send({ gender: 'F' });
      expect(res.statusCode).toBe(400);
    });

    it('should return 404 if user not found', async () => {
      (User.findByPk as jest.Mock).mockResolvedValue(null);
      const res = await request(app).post('/api/register/patient').send(patientData);
      expect(res.statusCode).toBe(404);
    });

    it('should return 409 if patient exists', async () => {
      (User.findByPk as jest.Mock).mockResolvedValue({ id: '1' });
      (Patient.findOne as jest.Mock).mockResolvedValue({ id: 'p1' });

      const res = await request(app).post('/api/register/patient').send(patientData);
      expect(res.statusCode).toBe(409);
    });

    it('should return 500 on DB error', async () => {
      (User.findByPk as jest.Mock).mockRejectedValue(new Error('DB error'));
      const res = await request(app).post('/api/register/patient').send(patientData);
      expect(res.statusCode).toBe(500);
    });
  });

  describe('POST /register/healthcareprofessional', () => {
    const hcpData = {
      speciality: SpecialityEnum.NURSE,
      structureId: 1,
      idn: '999999'
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return 201 if professional created', async () => {
      const mockUser = { id: '1' };
      const mockPro = { addStructure: jest.fn() };

      (User.findByPk as jest.Mock).mockResolvedValue(mockUser);
      (HealthcareProfessional.findOne as jest.Mock).mockResolvedValue(null);
      (HealthcareProfessional.create as jest.Mock).mockResolvedValue(mockPro);

      const res = await request(app).post('/api/register/healthcareprofessional').send(hcpData);
      expect(res.statusCode).toBe(201);
    });

    it('should return 400 if missing fields', async () => {
      const res = await request(app).post('/api/register/healthcareprofessional').send({});
      expect(res.statusCode).toBe(400);
    });

    it('should return 400 if enum invalid', async () => {
      const res = await request(app).post('/api/register/healthcareprofessional').send({ ...hcpData, speciality: 'WRONG' });
      expect(res.statusCode).toBe(400);
    });

    it('should return 404 if user not found', async () => {
      (User.findByPk as jest.Mock).mockResolvedValue(null);
      const res = await request(app).post('/api/register/healthcareprofessional').send(hcpData);
      expect(res.statusCode).toBe(404);
    });

    it('should return 409 if professional already exists', async () => {
      (User.findByPk as jest.Mock).mockResolvedValue({ id: '1' });
      (HealthcareProfessional.findOne as jest.Mock).mockResolvedValue({ id: 'existing' });

      const res = await request(app).post('/api/register/healthcareprofessional').send(hcpData);
      expect(res.statusCode).toBe(409);
    });

    it('should return 500 on error', async () => {
      (User.findByPk as jest.Mock).mockRejectedValue(new Error('DB Error'));
      const res = await request(app).post('/api/register/healthcareprofessional').send(hcpData);
      expect(res.statusCode).toBe(500);
    });
  });
});
