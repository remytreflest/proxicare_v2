import { IUserRepository } from '@/domain/repositories/IUserRepository';
import { IPatientRepository } from '@/domain/repositories/IPatientRepository';
import { IHealthcareProfessionalRepository } from '@/domain/repositories/IHealthcareProfessionalRepository';
import { IHealthcareActRepository } from '@/domain/repositories/IHealthcareActRepository';
import { IPrescriptionRepository } from '@/domain/repositories/IPrescriptionRepository';
import { IPrescriptionHealthcareActRepository } from '@/domain/repositories/IPrescriptionHealthcareActRepository';
import { RolesEnum } from '@/shared/enums/roles.enum';
import { PrescriptionHealthcareactsStatus } from '@/shared/enums/prescription-status.enum';
import { IPrescriptionActInput } from '@/domain/entities/Prescription.entity';
import { Prescription } from '@/infrastructure/database/models/Prescription.model';

export class CreatePrescription {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly patientRepo: IPatientRepository,
    private readonly professionalRepo: IHealthcareProfessionalRepository,
    private readonly actRepo: IHealthcareActRepository,
    private readonly prescriptionRepo: IPrescriptionRepository,
    private readonly prescriptionActRepo: IPrescriptionHealthcareActRepository,
  ) {}

  async execute(data: {
    userId: string;
    socialSecurityNumber: string;
    healthcareProfessionalId: number;
    startDate: string;
    endDate: string;
    acts: IPrescriptionActInput[];
  }): Promise<Prescription> {
    const user = await this.userRepo.findById(data.userId);
    if (!user) throw { status: 404, message: 'Utilisateur non trouvé.' };

    const roles = user.Roles ? user.Roles.split(',') : [];
    if (!roles.includes(RolesEnum.DOCTOR)) {
      throw { status: 403, message: 'Vous devez avoir le rôle DOCTOR pour créer une prescription.' };
    }

    const startDateObj = new Date(data.startDate);
    const endDateObj = new Date(data.endDate);

    if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
      throw { status: 400, message: 'Les dates ne sont pas valides.' };
    }
    if (startDateObj >= endDateObj) {
      throw { status: 400, message: 'La date de début doit être antérieure à la date de fin.' };
    }

    const patient = await this.patientRepo.findBySSN(data.socialSecurityNumber);
    if (!patient) throw { status: 404, message: 'Patient non trouvé.' };

    const professional = await this.professionalRepo.findById(data.healthcareProfessionalId);
    if (!professional) throw { status: 404, message: 'Professionnel de santé introuvable.' };

    for (const act of data.acts) {
      const existing = await this.actRepo.findByPkId(act.id);
      if (!existing) throw { status: 404, message: `Acte de soin ID ${act.id} introuvable.` };
      if (typeof act.occurrencesPerDay !== 'number' || act.occurrencesPerDay <= 0) {
        throw { status: 400, message: `OccurrencesPerDay invalide pour l'acte ${act.id}.` };
      }
    }

    const prescription = await this.prescriptionRepo.create({
      SocialSecurityNumber: data.socialSecurityNumber,
      HealthcareProfessionalId: data.healthcareProfessionalId,
      StartDate: startDateObj,
      EndDate: endDateObj,
    });

    for (const act of data.acts) {
      await this.prescriptionActRepo.create({
        PrescriptionId: prescription.Id,
        HealthcareActId: act.id,
        OccurrencesPerDay: act.occurrencesPerDay,
        Status: PrescriptionHealthcareactsStatus.TO_BE_PLANNED,
      });
    }

    return prescription;
  }
}
