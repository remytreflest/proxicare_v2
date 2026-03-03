import HealthcareAct from '@/infrastructure/database/models/HealthcareAct.model';
import { IHealthcareActRepository } from '@/domain/repositories/IHealthcareActRepository';

export class HealthcareActRepository implements IHealthcareActRepository {
  async findAll(): Promise<HealthcareAct[]> {
    return HealthcareAct.findAll();
  }

  async findById(id: number): Promise<HealthcareAct | null> {
    return HealthcareAct.findOne({ where: { Id: id } });
  }

  async findByPkId(id: number): Promise<HealthcareAct | null> {
    return HealthcareAct.findByPk(id);
  }

  async findByName(name: string): Promise<HealthcareAct | null> {
    return HealthcareAct.findOne({ where: { Name: name } });
  }

  async create(data: { Name: string; Description?: string; Price: number }): Promise<HealthcareAct> {
    return HealthcareAct.create({
      Name: data.Name.trim(),
      Description: data.Description?.trim() || null,
      Price: data.Price,
    });
  }
}
