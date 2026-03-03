import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  const tables = (await queryInterface.showAllTables()).map((t) => t.toLowerCase());

  if (tables.includes('prescriptionhealthcareacts')) return;

  await queryInterface.createTable('PrescriptionHealthcareActs', {
    Id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    PrescriptionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Prescriptions', key: 'Id' },
      onDelete: 'CASCADE',
    },
    HealthcareActId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'HealthcareActs', key: 'Id' },
      onDelete: 'CASCADE',
    },
    OccurrencesPerDay: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    CreatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    UpdatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('PrescriptionHealthcareActs');
}
