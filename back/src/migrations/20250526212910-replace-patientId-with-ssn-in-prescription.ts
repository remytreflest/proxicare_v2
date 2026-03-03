import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  const tableDescription = await queryInterface.describeTable('Prescriptions');

  if (tableDescription['PatientId']) {
    await queryInterface.removeColumn('Prescriptions', 'PatientId');
  }

  if (!tableDescription['SocialSecurityNumber']) {
    await queryInterface.addColumn('Prescriptions', 'SocialSecurityNumber', {
      type: DataTypes.STRING(20),
      allowNull: false,
      references: {
        model: 'Patients',
        key: 'SocialSecurityNumber',
      },
      onDelete: 'CASCADE',
    });
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.removeColumn('Prescriptions', 'SocialSecurityNumber');
  await queryInterface.addColumn('Prescriptions', 'PatientId', {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Patients',
      key: 'Id',
    },
    onDelete: 'CASCADE',
  });
}