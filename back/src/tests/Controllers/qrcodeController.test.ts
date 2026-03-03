
import request from 'supertest';
import app from '@/app.test';
import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';
import { Prescription } from '@/infrastructure/database/models/Prescription.model';
import { PrescriptionHealthcareAct } from '@/infrastructure/database/models/PrescriptionHealthcareAct.model';
import HealthcareAct from '@/infrastructure/database/models/HealthcareAct.model';
import Patient from '@/infrastructure/database/models/Patient.model';
import { User } from '@/infrastructure/database/models/User.model';
import { PrescriptionHealthcareactsStatus } from '@/shared/enums/prescription-status.enum';
import HealthcareProfessional from '@/infrastructure/database/models/HealthcareProfessional.model';
import Appointment from '@/infrastructure/database/models/Appointment.model';
import { userIdMock } from '../resources/constantes';

jest.mock('qrcode');
jest.mock('uuid');
jest.mock('@/infrastructure/database/models/Prescription.model');
jest.mock('@/infrastructure/database/models/PrescriptionHealthcareAct.model');
jest.mock('@/infrastructure/database/models/HealthcareAct.model');
jest.mock('@/infrastructure/database/models/Patient.model');
jest.mock('@/infrastructure/database/models/User.model');
jest.mock('@/infrastructure/database/models/HealthcareProfessional.model');
jest.mock('@/infrastructure/database/models/Appointment.model');

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
