import HealthcareProfessionalHealthcareAct from '@/infrastructure/database/models/HealthcareProfessionalHealthcareAct.model';
import { IHealthcareProfessionalHealthcareActRepository } from '@/domain/repositories/IHealthcareProfessionalHealthcareActRepository';

export class HealthcareProfessionalHealthcareActRepository implements IHealthcareProfessionalHealthcareActRepository {
  async findOne(professionalId: number, actId: number): Promise<HealthcareProfessionalHealthcareAct | null> {
    return HealthcareProfessionalHealthcareAct.findOne({
      where: { HealthcareProfessionalId: professionalId, HealthcareActId: actId },
    });
  }

  async create(data: { HealthcareProfessionalId: number; HealthcareActId: number }): Promise<HealthcareProfessionalHealthcareAct> {
    return HealthcareProfessionalHealthcareAct.create(data);
  }

  async delete(professionalId: number, actId: number): Promise<number> {
    return HealthcareProfessionalHealthcareAct.destroy({
      where: { HealthcareProfessionalId: professionalId, HealthcareActId: actId },
    });
  }
}
