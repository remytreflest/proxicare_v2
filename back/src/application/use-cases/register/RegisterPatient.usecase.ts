import { IUserRepository } from '@/domain/repositories/IUserRepository';
import { IPatientRepository } from '@/domain/repositories/IPatientRepository';
import { RolesEnum } from '@/shared/enums/roles.enum';
import { addUserRole } from '@/shared/helpers/user-roles.helper';
import Patient from '@/infrastructure/database/models/Patient.model';

export class RegisterPatient {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly patientRepo: IPatientRepository,
  ) {}

  async execute(data: {
    userId: string;
    birthday: string;
    gender: string;
    address: string;
    socialSecurityNumber: string;
    structureId: number;
  }): Promise<Patient> {
    const user = await this.userRepo.findByIdWithRelations(data.userId);
    if (!user) throw { status: 404, message: 'Utilisateur non trouvé.' };

    const existing = await this.patientRepo.findBySSN(data.socialSecurityNumber);
    if (existing) throw { status: 409, message: 'Un patient avec ce numéro de sécurité sociale existe déjà.' };

    const patient = await this.patientRepo.create({
      UserId: data.userId,
      Birthday: data.birthday,
      Gender: data.gender,
      Address: data.address || '',
      SocialSecurityNumber: data.socialSecurityNumber,
      StructureId: data.structureId,
    });

    await addUserRole(user, RolesEnum.PATIENT);

    return patient;
  }
}
