import { User } from '@/infrastructure/database/models/User.model';
import Patient from '@/infrastructure/database/models/Patient.model';
import HealthcareProfessional from '@/infrastructure/database/models/HealthcareProfessional.model';
import { Structure } from '@/infrastructure/database/models/Structure.model';
import { IUserRepository } from '@/domain/repositories/IUserRepository';

export class UserRepository implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    return User.findByPk(id);
  }

  async findByIdOrNull(id: string): Promise<User | null> {
    return User.findOne({ where: { Id: id } });
  }

  async findByIdWithRelations(id: string): Promise<User | null> {
    return User.findByPk(id, {
      include: [
        { model: Patient, include: [Structure] },
        { model: HealthcareProfessional, include: [{ model: Structure, through: { attributes: [] } }] },
      ],
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return User.findOne({ where: { Email: email } });
  }

  async create(data: { Id: string; FirstName: string; LastName: string; Email: string; Roles: string }): Promise<User> {
    return User.create(data);
  }
}
