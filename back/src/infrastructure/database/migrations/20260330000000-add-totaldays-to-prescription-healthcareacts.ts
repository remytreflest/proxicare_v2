import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  const tableDescription = await queryInterface.describeTable('PrescriptionHealthcareActs');

  if (!tableDescription['TotalDays']) {
    await queryInterface.addColumn('PrescriptionHealthcareActs', 'TotalDays', {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
    });
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.removeColumn('PrescriptionHealthcareActs', 'TotalDays');
}
