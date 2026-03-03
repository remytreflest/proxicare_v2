import { IUserRepository } from '@/domain/repositories/IUserRepository';
import { User } from '@/infrastructure/database/models/User.model';

export class GetCurrentUser {
  constructor(private readonly userRepo: IUserRepository) {}

  async execute(userId: string): Promise<User> {
    const user = await this.userRepo.findByIdWithRelations(userId);
    if (!user) throw { status: 404, message: 'Utilisateur introuvable.' };
    return user;
  }
}
