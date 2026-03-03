import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  const tableDescription = await queryInterface.describeTable('PrescriptionHealthcareActs');

  if (!tableDescription['Status']) {
    await queryInterface.addColumn('PrescriptionHealthcareActs', 'Status', {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'TO_BE_PLANNED',
    });
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.removeColumn('PrescriptionHealthcareActs', 'Status');
}