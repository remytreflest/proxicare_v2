import { IHealthcareProfessionalRepository } from '@/domain/repositories/IHealthcareProfessionalRepository';
import { IPrescriptionRepository } from '@/domain/repositories/IPrescriptionRepository';
import { Prescription } from '@/infrastructure/database/models/Prescription.model';

export class GetProfessionalPrescriptions {
  constructor(
    private readonly professionalRepo: IHealthcareProfessionalRepository,
    private readonly prescriptionRepo: IPrescriptionRepository,
  ) {}

  async execute(userId: string): Promise<Prescription[]> {
    const professional = await this.professionalRepo.findByUserIdWithStructures(userId);
    if (!professional) throw { status: 404, message: 'Professionnel de santé introuvable' };

    const structureIds = professional.Structures?.map(s => s.Id);
    if (!structureIds || structureIds.length === 0) {
      throw { status: 404, message: 'Aucune structure associée au professionnel' };
    }

    return this.prescriptionRepo.findAllForProfessionalStructures(structureIds);
  }
}
