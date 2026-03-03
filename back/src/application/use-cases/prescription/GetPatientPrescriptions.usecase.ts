import { IPatientRepository } from '@/domain/repositories/IPatientRepository';
import { IPrescriptionRepository } from '@/domain/repositories/IPrescriptionRepository';
import { Prescription } from '@/infrastructure/database/models/Prescription.model';

export class GetPatientPrescriptions {
  constructor(
    private readonly patientRepo: IPatientRepository,
    private readonly prescriptionRepo: IPrescriptionRepository,
  ) {}

  async execute(userId: string): Promise<Prescription[]> {
    const patient = await this.patientRepo.findByUserId(userId);
    if (!patient) throw { status: 403, message: 'Aucun patient associé à cet utilisateur.' };

    return this.prescriptionRepo.findAllBySSN(patient.SocialSecurityNumber);
  }
}
