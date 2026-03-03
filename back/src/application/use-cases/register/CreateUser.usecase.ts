import { IUserRepository } from '@/domain/repositories/IUserRepository';
import { RolesEnum } from '@/shared/enums/roles.enum';
import { joinRoles } from '@/shared/helpers/join-roles.helper';
import { User } from '@/infrastructure/database/models/User.model';

export class CreateUser {
  constructor(private readonly userRepo: IUserRepository) {}

  async execute(data: {
    auth0Id: string;
    firstName: string;
    lastName: string;
    email: string;
  }): Promise<User> {
    const roles: RolesEnum[] = [RolesEnum.USER];
    if (process.env.DEBUG === 'true') {
      roles.push(RolesEnum.ADMIN);
    }

    const existingById = await this.userRepo.findByIdOrNull(data.auth0Id);
    if (existingById) throw { status: 409, message: 'Un utilisateur avec cet ID existe déjà' };

    const existingByEmail = await this.userRepo.findByEmail(data.email);
    if (existingByEmail) throw { status: 409, message: 'Un utilisateur avec cet email existe déjà.' };

    return this.userRepo.create({
      Id: data.auth0Id,
      FirstName: data.firstName,
      LastName: data.lastName,
      Email: data.email,
      Roles: joinRoles(roles),
    });
  }
}
