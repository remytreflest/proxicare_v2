import { Model, DataTypes } from 'sequelize';
import sequelize from '@/infrastructure/config/database';
import Patient from './Patient.model';
import HealthcareProfessional from './HealthcareProfessional.model';

export class Prescription extends Model {
  public Id!: number;
  public SocialSecurityNumber!: string;
  public StartDate!: Date;
  public EndDate!: Date;
  public HealthcareProfessionalId!: number | null;

  public Patient?: Patient;
  public HealthcareProfessional?: HealthcareProfessional;
}

Prescription.init({
  Id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  SocialSecurityNumber: {
    type: DataTypes.STRING(20),
    allowNull: false,
    references: {
      model: 'Patients',
      key: 'SocialSecurityNumber'
    },
  },
  StartDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  EndDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  HealthcareProfessionalId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  sequelize,
  modelName: 'Prescription',
  tableName: 'Prescriptions',
  timestamps: true,
  createdAt: 'CreatedAt',
  updatedAt: 'UpdatedAt',
});
