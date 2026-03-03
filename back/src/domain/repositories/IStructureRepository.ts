import { Structure } from '@/infrastructure/database/models/Structure.model';

export interface IStructureRepository {
  findAll(): Promise<Structure[]>;
}
