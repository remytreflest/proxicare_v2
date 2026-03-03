import { IUserRepository } from '@/domain/repositories/IUserRepository';
import { IHealthcareProfessionalRepository } from '@/domain/repositories/IHealthcareProfessionalRepository';
import { RolesEnum } from '@/shared/enums/roles.enum';
import { SpecialityEnum } from '@/shared/enums/speciality.enum';
import { addUserRole } from '@/shared/helpers/user-roles.helper';
import HealthcareProfessional from '@/infrastructure/database/models/HealthcareProfessional.model';

export class RegisterHealthcareProfessional {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly professionalRepo: IHealthcareProfessionalRepository,
  ) {}

  async execute(data: {
    userId: string;
    speciality: string;
    structureId: number;
    idn: string;
  }): Promise<HealthcareProfessional> {
    if (!Object.values(SpecialityEnum).includes(data.speciality as SpecialityEnum)) {
      throw { status: 400, message: 'Rôle invalide.' };
    }

    const user = await this.userRepo.findByIdWithRelations(data.userId);
    if (!user) throw { status: 404, message: 'Utilisateur non trouvé.' };

    const existing = await this.professionalRepo.findByUserId(data.userId);
    if (existing) throw { status: 409, message: 'Un utilisateur avec cet ID existe déjà' };

    const professional = await this.professionalRepo.create({
      UserId: data.userId,
      Speciality: data.speciality,
      StructureId: data.structureId,
      IDN: data.idn,
    });

    await professional.addStructure(data.structureId);
    await addUserRole(user, RolesEnum.HEALTHCAREPROFESSIONAL);

    if (data.speciality === SpecialityEnum.DOCTOR) {
      await addUserRole(user, RolesEnum.DOCTOR);
    }

    return professional;
  }
}
