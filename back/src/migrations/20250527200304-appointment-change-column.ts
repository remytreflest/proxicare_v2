import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  const tableDescription = await queryInterface.describeTable('Appointments');

  if (tableDescription['HealthcareActId']) {
    await queryInterface.removeColumn('Appointments', 'HealthcareActId');
  }

  if (!tableDescription['PrescriptionHealthcareActId']) {
    await queryInterface.addColumn('Appointments', 'PrescriptionHealthcareActId', {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'PrescriptionHealthcareActs',
        key: 'Id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.removeColumn('Appointments', 'PrescriptionHealthcareActId');

  await queryInterface.addColumn('Appointments', 'HealthcareActId', {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'HealthcareActs',
      key: 'Id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });
}
