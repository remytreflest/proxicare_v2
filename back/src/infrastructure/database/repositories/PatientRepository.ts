import Patient from '@/infrastructure/database/models/Patient.model';
import { IPatientRepository } from '@/domain/repositories/IPatientRepository';

export class PatientRepository implements IPatientRepository {
  async findById(id: number): Promise<Patient | null> {
    return Patient.findOne({ where: { Id: id } });
  }

  async findByUserId(userId: string): Promise<Patient | null> {
    return Patient.findOne({ where: { UserId: userId } });
  }

  async findBySSN(ssn: string): Promise<Patient | null> {
    return Patient.findOne({ where: { SocialSecurityNumber: ssn } });
  }

  async create(data: {
    UserId: string;
    Birthday: string;
    Gender: string;
    Address: string;
    SocialSecurityNumber: string;
    StructureId: number;
  }): Promise<Patient> {
    return Patient.create(data);
  }
}
