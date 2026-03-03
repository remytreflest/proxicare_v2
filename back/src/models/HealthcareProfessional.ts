import { Model, DataTypes, Association } from 'sequelize';
import sequelize from '@/config/database';
import HealthcareAct from '@/models/HealthcareAct';
import { SpecialityEnum } from '@/resources/emuns/speciality';
import { Structure } from './Structure';

export class HealthcareProfessional extends Model {
  public Id!: number;
  public UserId!: number;
  public Speciality?: string;
  public IDN?: string;

  // Associations
  public readonly HealthcareActs?: HealthcareAct[];
  public readonly Structures?: Structure[];

  // Méthodes générées par belongsToMany
  public addStructure!: (structure: Structure | number) => Promise<void>;
  public getStructures!: () => Promise<Structure[]>;
  public setStructures!: (structures: Structure[] | number[]) => Promise<void>;

  public static associations: {
    healthcareActs: Association<HealthcareProfessional, HealthcareAct>;
    structures: Association<HealthcareProfessional, Structure>;
  };
}

HealthcareProfessional.init({
  Id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  UserId: {
    type: DataTypes.STRING(64),
    allowNull: false,
  },
  Speciality: {
    type: DataTypes.ENUM(...Object.values(SpecialityEnum)),
    allowNull: true,
  },
  StructureId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  IDN: {
    type: DataTypes.STRING(100),
    allowNull: true,
  }
}, {
  sequelize,
  modelName: 'HealthcareProfessional',
  tableName: 'HealthcareProfessionals',
  timestamps: true,
  createdAt: 'CreatedAt',
  updatedAt: 'UpdatedAt',
});

export default HealthcareProfessional;
