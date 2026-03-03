import { Structure } from '@/infrastructure/database/models/Structure.model';
import { IStructureRepository } from '@/domain/repositories/IStructureRepository';

export class StructureRepository implements IStructureRepository {
  async findAll(): Promise<Structure[]> {
    return Structure.findAll();
  }
}
