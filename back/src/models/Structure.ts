import { Model, DataTypes } from 'sequelize';
import sequelize from '@/config/database';

export class Structure extends Model {
  public Id!: number;
  public Name!: string;
  public Address!: string;
}

Structure.init({
  Id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  Name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  Address: {
    type: DataTypes.STRING(255),
    allowNull: false,
  }
}, {
  sequelize,
  modelName: 'Structure',
  tableName: 'Structures',
  timestamps: true,
  createdAt: 'CreatedAt',
  updatedAt: 'UpdatedAt',
});
