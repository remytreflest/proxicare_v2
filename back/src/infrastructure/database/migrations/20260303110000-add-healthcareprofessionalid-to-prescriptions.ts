import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  const tableDescription = await queryInterface.describeTable('Prescriptions');

  if (!tableDescription['HealthcareProfessionalId']) {
    await queryInterface.addColumn('Prescriptions', 'HealthcareProfessionalId', {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'HealthcareProfessionals',
        key: 'Id',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  const tableDescription = await queryInterface.describeTable('Prescriptions');

  if (tableDescription['HealthcareProfessionalId']) {
    await queryInterface.removeColumn('Prescriptions', 'HealthcareProfessionalId');
  }
}
