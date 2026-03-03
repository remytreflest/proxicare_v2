
import request from 'supertest';
import app from '@/app.test';
import Appointment from '@/infrastructure/database/models/Appointment.model';
import HealthcareProfessional from '@/infrastructure/database/models/HealthcareProfessional.model';
import HealthcareAct from '@/infrastructure/database/models/HealthcareAct.model';
import Patient from '@/infrastructure/database/models/Patient.model';
import { User } from '@/infrastructure/database/models/User.model';
import HealthcareProfessionalHealthcareAct from '@/infrastructure/database/models/HealthcareProfessionalHealthcareAct.model';
import { PrescriptionHealthcareAct } from '@/infrastructure/database/models/PrescriptionHealthcareAct.model';

jest.mock('@/infrastructure/database/models/Appointment.model');
jest.mock('@/infrastructure/database/models/HealthcareProfessional.model');
jest.mock('@/infrastructure/database/models/HealthcareAct.model');
jest.mock('@/infrastructure/database/models/Patient.model');
jest.mock('@/infrastructure/database/models/User.model');
jest.mock('@/infrastructure/database/models/HealthcareProfessionalHealthcareAct.model');
jest.mock('@/infrastructure/database/models/PrescriptionHealthcareAct.model');

describe('Appointment Controller', () => {
  const userId = 'user-1';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /appointments', () => {
    it('should return 200 with appointments', async () => {
      (User.findByPk as jest.Mock).mockResolvedValue({ Id: userId });
      (Patient.findOne as jest.Mock).mockResolvedValue({ Id: 1 });
      (HealthcareProfessional.findOne as jest.Mock).mockResolvedValue(null);
      (Appointment.findAll as jest.Mock).mockResolvedValue([{ id: 1 }]);

      const res = await request(app).get('/api/appointments');
      expect(res.statusCode).toBe(200);
    });

    it('should return 403 if user not found', async () => {
      (User.findByPk as jest.Mock).mockResolvedValue(null);

      const res = await request(app).get('/api/appointments');
      expect(res.statusCode).toBe(403);
    });

    it('should return 403 if no roles match', async () => {
      (User.findByPk as jest.Mock).mockResolvedValue({ Id: userId });
      (Patient.findOne as jest.Mock).mockResolvedValue(null);
      (HealthcareProfessional.findOne as jest.Mock).mockResolvedValue(null);

      const res = await request(app).get('/api/appointments');
      expect(res.statusCode).toBe(403);
    });

    it('should return 500 if error occurs', async () => {
      (User.findByPk as jest.Mock).mockRejectedValue(new Error('DB error'));

      const res = await request(app).get('/api/appointments');
      expect(res.statusCode).toBe(500);
    });
  });

  describe('POST /appointment', () => {
    it('should return 201 when appointment is created', async () => {
      (Patient.findOne as jest.Mock).mockResolvedValue({ Id: 1 });
      (HealthcareProfessional.findOne as jest.Mock).mockResolvedValue({ Id: 10 });
      (HealthcareAct.findOne as jest.Mock).mockResolvedValue({ Id: 99 });
      (PrescriptionHealthcareAct.findByPk as jest.Mock).mockResolvedValue({ HealthcareActId: 99, save: jest.fn() });
      (HealthcareProfessionalHealthcareAct.findOne as jest.Mock).mockResolvedValue(true);
      (Appointment.create as jest.Mock).mockResolvedValue({ id: 1 });

      const res = await request(app).post('/api/appointment').send(validPayload);
      expect(res.statusCode).toBe(201);
    });

    it('should return 400 if missing fields', async () => {
      const res = await request(app).post('/api/appointment').send({});
      expect(res.statusCode).toBe(400);
    });

    it('should return 400 if dates are not valid', async () => {
      const res = await request(app).post('/api/appointment').send({
        patientId: 1,
        prescriptionHealthcareActId: 1,
        appointmentStartDate: 'invalid',
        appointmentEndDate: 'also-invalid',
      });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Les dates ne sont pas valides.');
    });

    it('should return 400 if startDate >= endDate', async () => {
      const date = new Date().toISOString();
      const res = await request(app).post('/api/appointment').send({
        patientId: 1,
        prescriptionHealthcareActId: 1,
        appointmentStartDate: date,
        appointmentEndDate: date,
      });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('La date de début doit être antérieure à la date de fin.');
    });

    it('should return 400 if dates are not in the future', async () => {
      const pastDate = new Date(Date.now() - 1000 * 60 * 60).toISOString();
      const res = await request(app).post('/api/appointment').send({
        patientId: 1,
        prescriptionHealthcareActId: 1,
        appointmentStartDate: pastDate,
        appointmentEndDate: new Date().toISOString(),
      });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Les dates doivent être dans le futur.');
    });

    const validPayload = {
      patientId: 1,
      prescriptionHealthcareActId: 2,
      appointmentStartDate: new Date(Date.now() + 10000),
      appointmentEndDate: new Date(Date.now() + 20000),
    };

    it('should return 404 if patient not found', async () => {
      (Patient.findOne as jest.Mock).mockResolvedValue(null);

      const res = await request(app).post('/api/appointment').send(validPayload);
      expect(res.statusCode).toBe(404);
    });

    it('should return 404 if healthcareProfessional not found', async () => {
      (Patient.findOne as jest.Mock).mockResolvedValue({ Id: 1 });
      (HealthcareProfessional.findOne as jest.Mock).mockResolvedValue(null);

      const res = await request(app).post('/api/appointment').send(validPayload);
      expect(res.statusCode).toBe(404);
    });

    it('should return 403 if act not linked to professional', async () => {
      (Patient.findOne as jest.Mock).mockResolvedValue({ Id: 1 });
      (HealthcareProfessional.findOne as jest.Mock).mockResolvedValue({ Id: 1 });
      (PrescriptionHealthcareAct.findByPk as jest.Mock).mockResolvedValue({ HealthcareActId: 99 });
      (HealthcareProfessionalHealthcareAct.findOne as jest.Mock).mockResolvedValue(null);

      const res = await request(app).post('/api/appointment').send(validPayload);
      expect(res.statusCode).toBe(403);
    });

    it('should return 500 if exception thrown', async () => {
      (Patient.findOne as jest.Mock).mockRejectedValue(new Error('DB error'));
      const res = await request(app).post('/api/appointment').send(validPayload);
      expect(res.statusCode).toBe(500);
    });
  });

  describe('DELETE /appointment/:id', () => {
    it('should return 200 if appointment is deleted', async () => {
      (Appointment.findOne as jest.Mock).mockResolvedValue({
        Id: 1,
        destroy: jest.fn()
      });
      (User.findOne as jest.Mock).mockResolvedValue({ Id: userId });
      (Patient.findOne as jest.Mock).mockResolvedValue({});
      (HealthcareProfessional.findOne as jest.Mock).mockResolvedValue(null);

      const res = await request(app).delete('/api/appointment/1');
      expect(res.statusCode).toBe(200);
    });

    it('should return 400 if ID invalid', async () => {
      const res = await request(app).delete('/api/appointment/abc');
      expect(res.statusCode).toBe(400);
    });

    it('should return 404 if appointment not found', async () => {
      (Appointment.findOne as jest.Mock).mockResolvedValue(null);

      const res = await request(app).delete('/api/appointment/1');
      expect(res.statusCode).toBe(404);
    });

    it('should return 403 if user not found', async () => {
      (Appointment.findOne as jest.Mock).mockResolvedValue({});
      (User.findOne as jest.Mock).mockResolvedValue(null);

      const res = await request(app).delete('/api/appointment/1');
      expect(res.statusCode).toBe(403);
    });

    it('should return 403 if not authorized', async () => {
      (Appointment.findOne as jest.Mock).mockResolvedValue({});
      (User.findOne as jest.Mock).mockResolvedValue({ Id: userId });
      (Patient.findOne as jest.Mock).mockResolvedValue(null);
      (HealthcareProfessional.findOne as jest.Mock).mockResolvedValue(null);

      const res = await request(app).delete('/api/appointment/1');
      expect(res.statusCode).toBe(403);
    });

    it('should return 500 if exception occurs', async () => {
      (Appointment.findOne as jest.Mock).mockRejectedValue(new Error('DB Error'));

      const res = await request(app).delete('/api/appointment/1');
      expect(res.statusCode).toBe(500);
    });
  });
});
