import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  const tableDescription = await queryInterface.describeTable('PrescriptionHealthcareActs');

  if (!tableDescription['ValidateToken']) {
    await queryInterface.addColumn('PrescriptionHealthcareActs', 'ValidateToken', {
      type: DataTypes.UUID,
      allowNull: true,
      defaultValue: null,
    });
  }

  if (!tableDescription['ValidateTokenLimitTime']) {
    await queryInterface.addColumn('PrescriptionHealthcareActs', 'ValidateTokenLimitTime', {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    });
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.removeColumn('PrescriptionHealthcareActs', 'ValidateToken');
  await queryInterface.removeColumn('PrescriptionHealthcareActs', 'ValidateTokenLimitTime');
}
