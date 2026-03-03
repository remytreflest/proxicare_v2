
import request from 'supertest';
import app from '@/app.test';
import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';
import { Prescription } from '@/models/Prescription';
import { PrescriptionHealthcareAct } from '@/models/PrescriptionHealthcareAct';
import HealthcareAct from '@/models/HealthcareAct';
import Patient from '@/models/Patient';
import { User } from '@/models/User';
import { PrescriptionHealthcareactsStatus } from '@/resources/emuns/prescriptionHealthcareactsStatus';
import HealthcareProfessional from '@/models/HealthcareProfessional';
import Appointment from '@/models/Appointment';
import { userIdMock } from '../resources/constantes';

jest.mock('qrcode');
jest.mock('uuid');
jest.mock('@/models/Prescription');
jest.mock('@/models/PrescriptionHealthcareAct');
jest.mock('@/models/HealthcareAct');
jest.mock('@/models/Patient');
jest.mock('@/models/User');
jest.mock('@/models/HealthcareProfessional');
jest.mock('@/models/Appointment');

describe('QRCode Controller', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /qrcode/patient/:prescriptionHealthcareActId', () => {
    it('should return 201 with QR code when valid', async () => {
      (PrescriptionHealthcareAct.findByPk as jest.Mock).mockResolvedValue({
        Status: 'PLANNED',
        Prescription: {
          Patient: { UserId: userIdMock }
        },
        Appointments: [{ AppointmentEndDate: new Date(Date.now() + 1000000) }],
        update: jest.fn()
      });
      (QRCode.toDataURL as jest.Mock).mockResolvedValue('mockQrData');
      (uuidv4 as jest.Mock).mockReturnValue('token123');

      const res = await request(app)
        .get('/api/qrcode/patient/123');

      expect(res.statusCode).toBe(201);
    });

    it('should return 404 if prescription not found', async () => {
      (PrescriptionHealthcareAct.findByPk as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .get('/api/qrcode/patient/123');

      expect(res.statusCode).toBe(404);
    });

    it('should return 200 if status is PERFORMED', async () => {
      (PrescriptionHealthcareAct.findByPk as jest.Mock).mockResolvedValue({
        Status: 'PERFORMED',
      });

      const res = await request(app)
        .get('/api/qrcode/patient/123');

      expect(res.statusCode).toBe(400);
    });

    it('should return 200 if status is TO_BE_PLANNED', async () => {
      (PrescriptionHealthcareAct.findByPk as jest.Mock).mockResolvedValue({
        Status: 'TO_BE_PLANNED',
      });

      const res = await request(app)
        .get('/api/qrcode/patient/123');

      expect(res.statusCode).toBe(400);
    });

    it('should return 200 if status is CANCELLED', async () => {
      (PrescriptionHealthcareAct.findByPk as jest.Mock).mockResolvedValue({
        Status: 'CANCELLED',
      });

      const res = await request(app)
        .get('/api/qrcode/patient/123');

      expect(res.statusCode).toBe(400);
    });

    it('should return 403 if user is not the patient', async () => {
      (PrescriptionHealthcareAct.findByPk as jest.Mock).mockResolvedValue({
        Status: 'PLANNED',
        Prescription: {
          Patient: { UserId: 'other-user' }
        },
        Appointments: [{ AppointmentEndDate: new Date(Date.now() + 1000000) }]
      });

      const res = await request(app)
        .get('/api/qrcode/patient/123');

      expect(res.statusCode).toBe(403);
    });

    it('should return 400 if no appointments', async () => {
      (PrescriptionHealthcareAct.findByPk as jest.Mock).mockResolvedValue({
        Status: 'PLANNED',
        Prescription: {
          Patient: { UserId: userIdMock }
        },
        Appointments: []
      });

      const res = await request(app)
        .get('/api/qrcode/patient/123');

      expect(res.statusCode).toBe(400);
    });

    it('should return 500 on error', async () => {
      (PrescriptionHealthcareAct.findByPk as jest.Mock).mockRejectedValue(new Error('fail'));

      const res = await request(app)
        .get('/api/qrcode/patient/123');

      expect(res.statusCode).toBe(500);
    });
  });

  describe('GET /validate/healthcareprofessional/:prescriptionHealthcareActId/:token', () => {
    it('should return 200 if validation is successful', async () => {
      const mockUpdate = jest.fn();
      (PrescriptionHealthcareAct.findByPk as jest.Mock).mockResolvedValue({
        Status: 'PLANNED',
        ValidateToken: 'token123',
        ValidateTokenLimitTime: new Date(Date.now() + 100000),
        Prescription: {
          Patient: {
            StructureId: 1,
            User: { FirstName: 'John', LastName: 'Doe' }
          }
        },
        update: mockUpdate,
        HealthcareAct: { Name: 'Act Name' }
      });
      (HealthcareProfessional.findOne as jest.Mock).mockResolvedValue({
        Structures: [{ Id: 1 }]
      });

      const res = await request(app)
        .get('/api/validate/healthcareprofessional/123/token123');

      expect(res.statusCode).toBe(200);
    });

    it('should return 401 for invalid token', async () => {
      (PrescriptionHealthcareAct.findByPk as jest.Mock).mockResolvedValue({
        Status: 'PLANNED',
        ValidateToken: 'wrong-token',
        ValidateTokenLimitTime: new Date(Date.now() + 100000),
        Prescription: {
          Patient: { User: {} }
        }
      });

      const res = await request(app)
        .get('/api/validate/healthcareprofessional/123/invalidtoken');

      expect(res.statusCode).toBe(401);
    });

    it('should return 403 if professional not linked to patient', async () => {
      (PrescriptionHealthcareAct.findByPk as jest.Mock).mockResolvedValue({
        Status: 'PLANNED',
        ValidateToken: 'token123',
        ValidateTokenLimitTime: new Date(Date.now() + 100000),
        Prescription: {
          Patient: {
            StructureId: 99,
            User: { FirstName: 'John', LastName: 'Doe' }
          }
        }
      });
      (HealthcareProfessional.findOne as jest.Mock).mockResolvedValue({
        Structures: [{ Id: 1 }]
      });

      const res = await request(app)
        .get('/api/validate/healthcareprofessional/123/token123');

      expect(res.statusCode).toBe(403);
    });

    it('should return 500 on error', async () => {
      (PrescriptionHealthcareAct.findByPk as jest.Mock).mockRejectedValue(new Error('fail'));

      const res = await request(app)
        .get('/api/validate/healthcareprofessional/123/token123');

      expect(res.statusCode).toBe(500);
    });
  });
});
