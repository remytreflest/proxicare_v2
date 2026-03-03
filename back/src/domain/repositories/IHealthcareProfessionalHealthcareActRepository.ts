import HealthcareProfessionalHealthcareAct from '@/infrastructure/database/models/HealthcareProfessionalHealthcareAct.model';

export interface IHealthcareProfessionalHealthcareActRepository {
  findOne(professionalId: number, actId: number): Promise<HealthcareProfessionalHealthcareAct | null>;
  create(data: { HealthcareProfessionalId: number; HealthcareActId: number }): Promise<HealthcareProfessionalHealthcareAct>;
  delete(professionalId: number, actId: number): Promise<number>;
}
