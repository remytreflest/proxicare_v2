import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.createTable('HealthcareProfessionalHealthcareActs', {
    HealthcareProfessionalId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'HealthcareProfessionals',
        key: 'Id',
      },
      onDelete: 'CASCADE',
      primaryKey: true,
    },
    HealthcareActId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'HealthcareActs',
        key: 'Id',
      },
      onDelete: 'CASCADE',
      primaryKey: true,
    },
    CreatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    UpdatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('HealthcareProfessionalHealthcareActs');
}
