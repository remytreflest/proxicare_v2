import { IHealthcareActRepository } from '@/domain/repositories/IHealthcareActRepository';
import HealthcareAct from '@/infrastructure/database/models/HealthcareAct.model';

export class CreateHealthcareAct {
  constructor(private readonly actRepo: IHealthcareActRepository) {}

  async execute(data: { name: string; description?: string; price: number }): Promise<HealthcareAct> {
    const existing = await this.actRepo.findByName(data.name);
    if (existing) throw { status: 409, message: 'Un acte avec ce nom existe déjà.' };

    return this.actRepo.create({ Name: data.name, Description: data.description, Price: data.price });
  }
}
