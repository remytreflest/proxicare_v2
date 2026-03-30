import { IPrescriptionHealthcareActRepository } from '@/domain/repositories/IPrescriptionHealthcareActRepository';
import { IHealthcareProfessionalRepository } from '@/domain/repositories/IHealthcareProfessionalRepository';
import { PrescriptionHealthcareactsStatus } from '@/shared/enums/prescription-status.enum';

export class ValidateQrCode {
  constructor(
    private readonly prescriptionActRepo: IPrescriptionHealthcareActRepository,
    private readonly professionalRepo: IHealthcareProfessionalRepository,
  ) {}

  async execute(
    prescriptionHealthcareActId: number,
    token: string,
    userId: string,
  ): Promise<{ message: string; healthcareAct?: string; patientName?: string; validatedAt: Date }> {
    const prescriptionAct = await this.prescriptionActRepo.findByIdWithFullDetails(prescriptionHealthcareActId);
    if (!prescriptionAct) throw { status: 404, message: 'Prescription introuvable.' };

    if (
      !prescriptionAct.Prescription ||
      !prescriptionAct.Prescription.Patient ||
      !prescriptionAct.Prescription.Patient.User
    ) throw { status: 404, message: 'Problème durant la récupération des données.' };

    if (prescriptionAct.Status === PrescriptionHealthcareactsStatus.PERFORMED) {
      throw { status: 400, message: 'Ce soin a déjà été validé.' };
    }

    if (
      !prescriptionAct.ValidateToken ||
      prescriptionAct.ValidateToken !== token ||
      !prescriptionAct.ValidateTokenLimitTime ||
      new Date() > prescriptionAct.ValidateTokenLimitTime
    ) {
      throw { status: 401, message: 'Token invalide ou expiré.' };
    }

    const professional = await this.professionalRepo.findByUserId(userId);
    if (!professional) throw { status: 403, message: 'Soignant non autorisé.' };

    if (prescriptionAct.Prescription.HealthcareProfessionalId !== professional.Id) {
      throw { status: 403, message: "Vous n'êtes pas le professionnel assigné à cette prescription." };
    }

    await prescriptionAct.update({ Status: PrescriptionHealthcareactsStatus.PERFORMED });

    const user = prescriptionAct.Prescription.Patient.User;
    return {
      message: 'Soin validé avec succès.',
      healthcareAct: prescriptionAct.HealthcareAct?.Name,
      patientName: `${user.FirstName} ${user.LastName}`,
      validatedAt: new Date(),
    };
  }
}
