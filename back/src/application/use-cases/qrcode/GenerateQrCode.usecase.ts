import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';
import { IPrescriptionHealthcareActRepository } from '@/domain/repositories/IPrescriptionHealthcareActRepository';
import { PrescriptionHealthcareactsStatus } from '@/shared/enums/prescription-status.enum';

export class GenerateQrCode {
  constructor(private readonly prescriptionActRepo: IPrescriptionHealthcareActRepository) {}

  async execute(prescriptionHealthcareActId: number, userId: string): Promise<{ qrCodeDataUrl: string }> {
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

    const validAppointments = prescriptionAct.Appointments?.filter(
      a => a.AppointmentEndDate >= new Date()
    );
    if (!validAppointments || validAppointments.length === 0) {
      throw { status: 400, message: 'Aucun rendez-vous actif pour ce soin.' };
    }

    const token = uuidv4();
    const limit = new Date(Date.now() + 15 * 1000);

    await prescriptionAct.update({ ValidateToken: token, ValidateTokenLimitTime: limit });

    const host = process.env.LOCAL_IP_SAME_WIFI ? process.env.FRONT_URL_LOCAL : process.env.FRONT_URL;
    const url = `${host}/validate-act/healthcareprofessional/${prescriptionHealthcareActId}/${token}`;
    const qrCodeDataUrl = await QRCode.toDataURL(url);

    return { qrCodeDataUrl };
  }
}
