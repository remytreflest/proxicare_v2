import { PrescriptionHealthcareAct } from '@/infrastructure/database/models/PrescriptionHealthcareAct.model';
import { Prescription } from '@/infrastructure/database/models/Prescription.model';
import Patient from '@/infrastructure/database/models/Patient.model';
import { User } from '@/infrastructure/database/models/User.model';
import Appointment from '@/infrastructure/database/models/Appointment.model';
import HealthcareAct from '@/infrastructure/database/models/HealthcareAct.model';
import { IPrescriptionHealthcareActRepository } from '@/domain/repositories/IPrescriptionHealthcareActRepository';

export class PrescriptionHealthcareActRepository implements IPrescriptionHealthcareActRepository {
  async findById(id: number): Promise<PrescriptionHealthcareAct | null> {
    return PrescriptionHealthcareAct.findByPk(id);
  }

  async findByIdWithPatient(id: number): Promise<PrescriptionHealthcareAct | null> {
    return PrescriptionHealthcareAct.findByPk(id, {
      include: [
        {
          model: Prescription,
          include: [{ model: Patient, include: [User] }],
        },
        { model: Appointment, required: false },
      ],
    });
  }

  async findByIdWithFullDetails(id: number): Promise<PrescriptionHealthcareAct | null> {
    return PrescriptionHealthcareAct.findByPk(id, {
      include: [
        { model: HealthcareAct },
        {
          model: Prescription,
          include: [{ model: Patient, include: [User] }],
        },
      ],
    });
  }

  async create(data: {
    PrescriptionId: number;
    HealthcareActId: number;
    OccurrencesPerDay: number;
    Status: string;
  }): Promise<PrescriptionHealthcareAct> {
    return PrescriptionHealthcareAct.create(data);
  }
}
