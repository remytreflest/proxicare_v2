import { Model, DataTypes } from 'sequelize';
import sequelize from '@/config/database';

class HealthcareProfessionalHealthcareAct extends Model {}

HealthcareProfessionalHealthcareAct.init({
  HealthcareProfessionalId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
  },
  HealthcareActId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
  }
}, {
  sequelize,
  modelName: 'HealthcareProfessionalHealthcareAct',
  tableName: 'HealthcareProfessionalHealthcareActs',
  timestamps: true,
  createdAt: 'CreatedAt',
  updatedAt: 'UpdatedAt',
});

export default HealthcareProfessionalHealthcareAct;