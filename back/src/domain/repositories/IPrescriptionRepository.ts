import { Prescription } from '@/infrastructure/database/models/Prescription.model';

export interface IPrescriptionRepository {
  create(data: {
    SocialSecurityNumber: string;
    HealthcareProfessionalId: number;
    StartDate: Date;
    EndDate: Date;
  }): Promise<Prescription>;
  findAllBySSN(ssn: string): Promise<Prescription[]>;
  findAllForProfessionalStructures(structureIds: number[]): Promise<Prescription[]>;
}
