import HealthcareAct from '@/infrastructure/database/models/HealthcareAct.model';

export interface IHealthcareActRepository {
  findAll(): Promise<HealthcareAct[]>;
  findById(id: number): Promise<HealthcareAct | null>;
  findByPkId(id: number): Promise<HealthcareAct | null>;
  findByName(name: string): Promise<HealthcareAct | null>;
  create(data: { Name: string; Description?: string; Price: number }): Promise<HealthcareAct>;
}
