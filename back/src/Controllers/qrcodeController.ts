import { Router, Request, Response } from 'express';
import { serverError } from '@/helpers/serverError';
import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';
import { Prescription } from '@/models/Prescription';
import { PrescriptionHealthcareAct } from '@/models/PrescriptionHealthcareAct';
import HealthcareAct from '@/models/HealthcareAct';
import Patient from '@/models/Patient';
import { User } from '@/models/User';
import { PrescriptionHealthcareactsStatus } from '@/resources/emuns/prescriptionHealthcareactsStatus';
import HealthcareProfessional from '@/models/HealthcareProfessional';
import Appointment from '@/models/Appointment';

const router = Router();

// Route 1 - Génération du QR Code
router.get('/qrcode/patient/:prescriptionHealthcareActId', async (req: any, res: any) => {
  try {
    const { prescriptionHealthcareActId } = req.params;
    const userId = req.userId; // supposé injecté par un middleware d'auth

    // Récupération complète du soin avec prescription + patient + rdv
    const prescriptionAct = await PrescriptionHealthcareAct.findByPk(prescriptionHealthcareActId, {
      include: [
        {
          model: Prescription,
          include: [{ model: Patient, include: [User] }],
        },
        {
          model: Appointment,
          required: false,
        }
      ],
    });

    if (!prescriptionAct) return res.status(404).json({ message: 'Acte de prescription introuvable.' });

    if (prescriptionAct.Status === PrescriptionHealthcareactsStatus.PERFORMED) {
      return res.status(400).json({ message: 'Ce soin a déjà été validé.' });
    }

    if (prescriptionAct.Status === PrescriptionHealthcareactsStatus.TO_BE_PLANNED) {
      return res.status(400).json({ message: 'Ce soin n\'est pas encore prévu.' });
    }

    if (prescriptionAct.Status === PrescriptionHealthcareactsStatus.CANCELLED) {
      return res.status(400).json({ message: 'Ce soin a été annulé.' });
    }

    // Vérifie que l'utilisateur connecté est bien le patient concerné
    const patient = prescriptionAct.Prescription?.Patient;
    if (!patient || patient.UserId !== userId) {
      return res.status(403).json({ message: 'Accès interdit. Ce soin ne vous appartient pas.' });
    }

    // Vérifie qu'il existe au moins un rendez-vous
    const validAppointments = prescriptionAct.Appointments?.filter(appointment => {
      return appointment.AppointmentEndDate >= new Date();
    });

    if (!validAppointments || validAppointments.length === 0) {
      return res.status(400).json({ message: 'Aucun rendez-vous actif pour ce soin.' });
    }

    // Génère token + limite de validité
    const token = uuidv4();
    const limit = new Date(Date.now() + 15 * 1000); // 15s

    await prescriptionAct.update({
      ValidateToken: token,
      ValidateTokenLimitTime: limit,
    });

    const host = process.env.LOCAL_IP_SAME_WIFI ? process.env.FRONT_URL_LOCAL : process.env.FRONT_URL;
    const url = `${host}/validate-act/healthcareprofessional/${prescriptionHealthcareActId}/${token}`;
    const qrCodeDataUrl = await QRCode.toDataURL(url);

    return res.status(201).json({ qrCodeDataUrl, validationUrl: url });
  } catch (err) {
    return serverError(res, err);
  }
});

// Route 2 - Validation
router.get('/validate/healthcareprofessional/:prescriptionHealthcareActId/:token', async (req: any, res: any) => {
  try {
    console.log(req.params)
    const { prescriptionHealthcareActId, token } = req.params;
    const userId = req.userId;

    const prescriptionAct = await PrescriptionHealthcareAct.findByPk(prescriptionHealthcareActId, {
      include: [
        { model: HealthcareAct },
        {
          model: Prescription,
          include: [{ model: Patient, include: [User] }],
        },
      ],
    });

    if (!prescriptionAct) return res.status(404).json({ message: 'Prescription introuvable.' });

    if (!prescriptionAct.Prescription || 
        !prescriptionAct.Prescription.Patient ||
        !prescriptionAct.Prescription.Patient.User
    ) return res.status(404).json({ message: 'Problème durant la récupération des données.' });

    if (prescriptionAct.Status === PrescriptionHealthcareactsStatus.PERFORMED) {
      return res.status(400).json({ message: 'Ce soin a déjà été validé.' });
    }

    if (
      !prescriptionAct.ValidateToken ||
      prescriptionAct.ValidateToken !== token ||
      !prescriptionAct.ValidateTokenLimitTime ||
      new Date() > prescriptionAct.ValidateTokenLimitTime
    ) {
      return res.status(401).json({ message: 'Token invalide ou expiré.' });
    }

    // Vérifie si le soignant connecté est bien lié à l’acte
    const professional = await HealthcareProfessional.findOne({
      where: { UserId: userId },
      include: ['Structures'],
    });

    if (!professional) return res.status(403).json({ message: 'Soignant non autorisé.' });

    const patientStructureId = prescriptionAct.Prescription.Patient.StructureId!;
    const professionalStructureIds = professional.Structures?.map((s) => s.Id);

    if (!professionalStructureIds || !professionalStructureIds.includes(patientStructureId)) {
      return res.status(403).json({ message: 'Vous n’êtes pas lié à ce patient.' });
    }

    await prescriptionAct.update({
      Status: PrescriptionHealthcareactsStatus.PERFORMED,
    });

    const user = prescriptionAct.Prescription.Patient.User;
    console.log(prescriptionAct)

    return res.status(200).json({
      message: 'Soin validé avec succès.',
      healthcareAct: prescriptionAct.HealthcareAct?.Name,
      patientName: `${user.FirstName} ${user.LastName}`,
      validatedAt: new Date(),
    });
  } catch (err) {
    return serverError(res, err);
  }
});

export default router;
