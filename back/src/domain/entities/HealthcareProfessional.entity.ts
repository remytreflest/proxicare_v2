import { IHealthcareAct } from './HealthcareAct.entity';
import { IStructure } from './Structure.entity';

export interface IHealthcareProfessional {
  Id: number;
  UserId: string;
  Speciality?: string;
  IDN?: string;
  HealthcareActs?: IHealthcareAct[];
  Structures?: IStructure[];
}
