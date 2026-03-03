import HealthcareProfessional from '@/infrastructure/database/models/HealthcareProfessional.model';
import HealthcareAct from '@/infrastructure/database/models/HealthcareAct.model';
import { Structure } from '@/infrastructure/database/models/Structure.model';
import { IHealthcareProfessionalRepository } from '@/domain/repositories/IHealthcareProfessionalRepository';

export class HealthcareProfessionalRepository implements IHealthcareProfessionalRepository {
  async findById(id: number): Promise<HealthcareProfessional | null> {
    return HealthcareProfessional.findByPk(id);
  }

  async findByUserId(userId: string): Promise<HealthcareProfessional | null> {
    return HealthcareProfessional.findOne({ where: { UserId: userId } });
  }

  async findByUserIdWithStructures(userId: string): Promise<HealthcareProfessional | null> {
    return HealthcareProfessional.findOne({
      where: { UserId: userId },
      include: [{ model: Structure }],
    });
  }

  async findByUserIdWithActs(userId: string): Promise<HealthcareProfessional | null> {
    return HealthcareProfessional.findOne({
      where: { UserId: userId },
      include: [HealthcareAct],
    });
  }

  async findAllWithActs(): Promise<HealthcareProfessional[]> {
    return HealthcareProfessional.findAll({ include: [HealthcareAct] });
  }

  async create(data: { UserId: string; Speciality: string; StructureId: number; IDN: string }): Promise<HealthcareProfessional> {
    return HealthcareProfessional.create(data);
  }
}
