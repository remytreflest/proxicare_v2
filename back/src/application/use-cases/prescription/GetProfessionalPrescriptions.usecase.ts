import { IHealthcareProfessionalRepository } from '@/domain/repositories/IHealthcareProfessionalRepository';
import { IPrescriptionRepository } from '@/domain/repositories/IPrescriptionRepository';
import { Prescription } from '@/infrastructure/database/models/Prescription.model';

export class GetProfessionalPrescriptions {
  constructor(
    private readonly professionalRepo: IHealthcareProfessionalRepository,
    private readonly prescriptionRepo: IPrescriptionRepository,
  ) {}

  async execute(userId: string): Promise<Prescription[]> {
    const professional = await this.professionalRepo.findByUserId(userId);
    if (!professional) throw { status: 404, message: 'Professionnel de santé introuvable' };

    return this.prescriptionRepo.findAllByProfessionalId(professional.Id);
  }
}
