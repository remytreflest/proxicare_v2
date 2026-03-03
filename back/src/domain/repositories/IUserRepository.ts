import { User } from '@/infrastructure/database/models/User.model';

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByIdOrNull(id: string): Promise<User | null>;
  findByIdWithRelations(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(data: { Id: string; FirstName: string; LastName: string; Email: string; Roles: string }): Promise<User>;
}
