import { Model, DataTypes } from 'sequelize';
import sequelize from '@/config/database';
import Patient from './Patient';
import HealthcareProfessional from './HealthcareProfessional';

export class User extends Model {
  public Id!: number;
  public FirstName!: string;
  public LastName!: string;
  public Email!: string;
  public Roles!: string;
  public CreatedAt!: Date;
  public Patient!: Patient;
  public HealthcareProfessional!: HealthcareProfessional;
}

User.init({
  Id: {
    type: DataTypes.STRING(64),
    allowNull: false,  // Id devient obligatoire
    primaryKey: true,  // Confirmer que Id est la clé primaire
    autoIncrement: false,  // Désactivation de l'auto-incrémentation
  },
  FirstName: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  LastName: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  Email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
  },
  
  Roles: {
    type: DataTypes.STRING(255),
    allowNull: false,
  }
}, {
  sequelize,
  modelName: 'User',
  tableName: 'Users',
  timestamps: true,
  createdAt: 'CreatedAt',
  updatedAt: 'UpdatedAt',
});
