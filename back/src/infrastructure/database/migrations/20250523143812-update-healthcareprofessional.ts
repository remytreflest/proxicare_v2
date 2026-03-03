import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  const tableDescription = await queryInterface.describeTable('HealthcareProfessionals');

  if (!tableDescription['IDN']) {
    await queryInterface.addColumn('HealthcareProfessionals', 'IDN', {
      type: DataTypes.STRING(100),
      allowNull: true,
    });
  }

  if (!tableDescription['StructureId']) {
    await queryInterface.addColumn('HealthcareProfessionals', 'StructureId', {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Structures',
        key: 'Id',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.removeColumn('HealthcareProfessionals', 'StructureId');
  await queryInterface.removeColumn('HealthcareProfessionals', 'IDN');
}