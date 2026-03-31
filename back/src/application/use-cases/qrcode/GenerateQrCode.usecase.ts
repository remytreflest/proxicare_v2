import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';
import { IPrescriptionHealthcareActRepository } from '@/domain/repositories/IPrescriptionHealthcareActRepository';
import { PrescriptionHealthcareactsStatus } from '@/shared/enums/prescription-status.enum';

export class GenerateQrCode {
  constructor(private readonly prescriptionActRepo: IPrescriptionHealthcareActRepository) {}

  async execute(prescriptionHealthcareActId: number, appointmentId: number, userId: string): Promise<{ qrCodeDataUrl: string }> {
    const prescriptionAct = await this.prescriptionActRepo.findByIdWithPatient(prescriptionHealthcareActId);
    if (!prescriptionAct) throw { status: 404, message: 'Acte de prescription introuvable.' };

    if (prescriptionAct.Status === PrescriptionHealthcareactsStatus.PERFORMED) {
      throw { status: 400, message: 'Ce soin a déjà été validé.' };
    }
    if (prescriptionAct.Status === PrescriptionHealthcareactsStatus.TO_BE_PLANNED) {
      throw { status: 400, message: "Ce soin n'est pas encore prévu." };
    }
    if (prescriptionAct.Status === PrescriptionHealthcareactsStatus.CANCELLED) {
      throw { status: 400, message: 'Ce soin a été annulé.' };
    }

    const patient = prescriptionAct.Prescription?.Patient;
    if (!patient || patient.UserId !== userId) {
      throw { status: 403, message: 'Accès interdit. Ce soin ne vous appartient pas.' };
    }

    const appointment = prescriptionAct.Appointments?.find(a => a.Id === appointmentId);
    if (!appointment) {
      throw { status: 404, message: 'Rendez-vous introuvable pour ce soin.' };
    }
    if (appointment.Status === 'PERFORMED') {
      throw { status: 400, message: 'Ce rendez-vous a déjà été validé.' };
    }
    if (appointment.Status === 'CANCELLED') {
      throw { status: 400, message: 'Ce rendez-vous a été annulé.' };
    }

    const token = uuidv4();
    const limit = new Date(Date.now() + 15 * 1000);

    await prescriptionAct.update({ ValidateToken: token, ValidateTokenLimitTime: limit });

    const url = `${process.env.FRONT_URL}/validate-act/healthcareprofessional/${prescriptionHealthcareActId}/${appointmentId}/${token}`;
    const qrCodeDataUrl = await QRCode.toDataURL(url);

    return { qrCodeDataUrl };
  }
}
