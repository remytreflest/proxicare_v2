import { IStructureRepository } from '@/domain/repositories/IStructureRepository';
import { Structure } from '@/infrastructure/database/models/Structure.model';

export class GetStructures {
  constructor(private readonly structureRepo: IStructureRepository) {}

  async execute(): Promise<Structure[]> {
    return this.structureRepo.findAll();
  }
}
