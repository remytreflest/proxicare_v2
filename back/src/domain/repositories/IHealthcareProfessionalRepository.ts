import HealthcareProfessional from '@/infrastructure/database/models/HealthcareProfessional.model';

export interface IHealthcareProfessionalRepository {
  findById(id: number): Promise<HealthcareProfessional | null>;
  findByUserId(userId: string): Promise<HealthcareProfessional | null>;
  findByUserIdWithStructures(userId: string): Promise<HealthcareProfessional | null>;
  findByUserIdWithActs(userId: string): Promise<HealthcareProfessional | null>;
  findAllWithActs(): Promise<HealthcareProfessional[]>;
  create(data: { UserId: string; Speciality: string; StructureId: number; IDN: string }): Promise<HealthcareProfessional>;
}
