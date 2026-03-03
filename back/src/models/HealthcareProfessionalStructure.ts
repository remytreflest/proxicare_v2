import { Model, DataTypes } from 'sequelize';
import sequelize from '@/config/database';

export class HealthcareProfessionalStructure extends Model {
  public HealthcareProfessionalId!: number;
  public StructureId!: number;
}

HealthcareProfessionalStructure.init({
  HealthcareProfessionalId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
  },
  StructureId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
  }
}, {
  sequelize,
  modelName: 'HealthcareProfessionalStructure',
  tableName: 'HealthcareProfessionalStructures',
  timestamps: true,
  createdAt: 'CreatedAt',
  updatedAt: 'UpdatedAt',
});
