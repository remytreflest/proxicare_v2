import request from 'supertest';
import app from '@/app.test';
import { Prescription } from '@/models/Prescription';
import { PrescriptionHealthcareAct } from '@/models/PrescriptionHealthcareAct';
import HealthcareAct from '@/models/HealthcareAct';
import Patient from '@/models/Patient';
import HealthcareProfessional from '@/models/HealthcareProfessional';
import { User } from '@/models/User';
import { Structure } from '@/models/Structure';
import Appointment from '@/models/Appointment';

jest.mock('@/models/Prescription');
jest.mock('@/models/PrescriptionHealthcareAct');
jest.mock('@/models/HealthcareAct');
jest.mock('@/models/Patient');
jest.mock('@/models/HealthcareProfessional');
jest.mock('@/models/User');
jest.mock('@/models/Structure');
jest.mock('@/models/Appointment');

describe('Prescription Controller', () => {
  const userId = 'user-123';
  const validPatient = { SocialSecurityNumber: '123456789', UserId: userId };
  const validAct = { id: 1, occurrencesPerDay: 1 };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /prescriptions', () => {
    it('should create a prescription with valid data', async () => {
      (Patient.findOne as jest.Mock).mockResolvedValue(validPatient);
      (HealthcareAct.findByPk as jest.Mock).mockResolvedValue(validAct);
      (Prescription.create as jest.Mock).mockResolvedValue({ Id: 1 });
      (PrescriptionHealthcareAct.create as jest.Mock).mockResolvedValue(true);

      const res = await request(app).post('/api/prescriptions').send({
        socialSecurityNumber: '123456789',
        startDate: '2025-05-30',
        endDate: '2025-05-31',
        acts: [validAct],
      });

      expect(res.statusCode).toBe(201);
    });

    it('should return 400 on missing fields', async () => {
      const res = await request(app).post('/api/prescriptions').send({});
      expect(res.statusCode).toBe(400);
    });

    it('should return 404 if patient not found', async () => {
      (Patient.findOne as jest.Mock).mockResolvedValue(null);
      const res = await request(app).post('/api/prescriptions').send({
        socialSecurityNumber: '123456789',
        startDate: '2025-05-30',
        endDate: '2025-05-31',
        acts: [validAct],
      });
      expect(res.statusCode).toBe(404);
    });

    it('should return 404 if act not found', async () => {
      (Patient.findOne as jest.Mock).mockResolvedValue(validPatient);
      (HealthcareAct.findByPk as jest.Mock).mockResolvedValue(null);

      const res = await request(app).post('/api/prescriptions').send({
        socialSecurityNumber: '123456789',
        startDate: '2025-05-30',
        endDate: '2025-05-31',
        acts: [validAct],
      });

      expect(res.statusCode).toBe(404);
    });

    it('should return 400 if occurrencesPerDay invalid', async () => {
      (Patient.findOne as jest.Mock).mockResolvedValue(validPatient);
      (HealthcareAct.findByPk as jest.Mock).mockResolvedValue(validAct);

      const res = await request(app).post('/api/prescriptions').send({
        socialSecurityNumber: '123456789',
        startDate: '2025-05-30',
        endDate: '2025-05-31',
        acts: [{ id: 1, occurrencesPerDay: 0 }],
      });

      expect(res.statusCode).toBe(400);
    });

    it('should return 500 on error', async () => {
      (Patient.findOne as jest.Mock).mockRejectedValue(new Error('fail'));
      const res = await request(app).post('/api/prescriptions').send({
        socialSecurityNumber: '123456789',
        startDate: '2025-05-30',
        endDate: '2025-05-31',
        acts: [validAct],
      });
      expect(res.statusCode).toBe(500);
    });
  });

  describe('GET /prescriptions/patient', () => {
    it('should return prescriptions for patient', async () => {
      (Patient.findOne as jest.Mock).mockResolvedValue(validPatient);
      (Prescription.findAll as jest.Mock).mockResolvedValue([]);

      const res = await request(app)
        .get('/api/prescriptions/patient');

      expect(res.statusCode).toBe(200);
    });

    it('should return 403 if patient not found', async () => {
      (Patient.findOne as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .get('/api/prescriptions/patient');

      expect(res.statusCode).toBe(403);
    });

    it('should return 500 on error', async () => {
      (Patient.findOne as jest.Mock).mockRejectedValue(new Error('fail'));

      const res = await request(app)
        .get('/api/prescriptions/patient');

      expect(res.statusCode).toBe(500);
    });
  });

  describe('GET /prescriptions/healthcareprofessional', () => {
    it('should return prescriptions for healthcare professional', async () => {
      const mockProfessional = { Structures: [{ Id: 1 }] };
      (HealthcareProfessional.findOne as jest.Mock).mockResolvedValue(mockProfessional);
      (Prescription.findAll as jest.Mock).mockResolvedValue([]);

      const res = await request(app)
        .get('/api/prescriptions/healthcareprofessional');

      expect(res.statusCode).toBe(200);
    });

    it('should return 404 if professional not found', async () => {
      (HealthcareProfessional.findOne as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .get('/api/prescriptions/healthcareprofessional');

      expect(res.statusCode).toBe(404);
    });

    it('should return 500 on error', async () => {
      (HealthcareProfessional.findOne as jest.Mock).mockRejectedValue(new Error('fail'));

      const res = await request(app)
        .get('/api/prescriptions/healthcareprofessional');

      expect(res.statusCode).toBe(500);
    });
  });
});
