import { PrescriptionHealthcareAct } from '@/infrastructure/database/models/PrescriptionHealthcareAct.model';

export interface IPrescriptionHealthcareActRepository {
  findById(id: number): Promise<PrescriptionHealthcareAct | null>;
  findByIdWithFullDetails(id: number): Promise<PrescriptionHealthcareAct | null>;
  findByIdWithPatient(id: number): Promise<PrescriptionHealthcareAct | null>;
  create(data: {
    PrescriptionId: number;
    HealthcareActId: number;
    OccurrencesPerDay: number;
    Status: string;
  }): Promise<PrescriptionHealthcareAct>;
}
