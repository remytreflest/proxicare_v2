import Patient from '@/infrastructure/database/models/Patient.model';

export interface IPatientRepository {
  findById(id: number): Promise<Patient | null>;
  findByUserId(userId: string): Promise<Patient | null>;
  findBySSN(ssn: string): Promise<Patient | null>;
  create(data: {
    UserId: string;
    Birthday: string;
    Gender: string;
    Address: string;
    SocialSecurityNumber: string;
    StructureId: number;
  }): Promise<Patient>;
}
