import { Prescription } from '@/infrastructure/database/models/Prescription.model';
import { PrescriptionHealthcareAct } from '@/infrastructure/database/models/PrescriptionHealthcareAct.model';
import HealthcareAct from '@/infrastructure/database/models/HealthcareAct.model';
import Patient from '@/infrastructure/database/models/Patient.model';
import { User } from '@/infrastructure/database/models/User.model';
import Appointment from '@/infrastructure/database/models/Appointment.model';
import { IPrescriptionRepository } from '@/domain/repositories/IPrescriptionRepository';
import { col, Op } from 'sequelize';

export class PrescriptionRepository implements IPrescriptionRepository {
  async create(data: {
    SocialSecurityNumber: string;
    HealthcareProfessionalId: number;
    StartDate: Date;
    EndDate: Date;
  }): Promise<Prescription> {
    return Prescription.create(data);
  }

  async findAllBySSN(ssn: string): Promise<Prescription[]> {
    return Prescription.findAll({
      where: { SocialSecurityNumber: ssn },
      include: [{ model: PrescriptionHealthcareAct, include: [HealthcareAct] }],
    });
  }

  async findAllForProfessionalStructures(structureIds: number[]): Promise<Prescription[]> {
    return Prescription.findAll({
      where: { StartDate: { [Op.gte]: new Date() } },
      include: [
        {
          model: Patient,
          as: 'Patient',
          required: true,
          on: {
            '$Prescription.SocialSecurityNumber$': { [Op.eq]: col('Patient.SocialSecurityNumber') },
          },
          where: { StructureId: { [Op.in]: structureIds } },
          include: [{ model: User, as: 'User', attributes: ['FirstName', 'LastName', 'Email'] }],
        },
        {
          model: PrescriptionHealthcareAct,
          include: [HealthcareAct, { model: Appointment, as: 'Appointments' }],
        },
      ],
    });
  }
}
