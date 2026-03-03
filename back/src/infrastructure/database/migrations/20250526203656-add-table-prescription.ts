import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  const tables = (await queryInterface.showAllTables()).map((t) => t.toLowerCase());

  if (tables.includes('prescriptions')) return;

  await queryInterface.createTable('Prescriptions', {
    Id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    PatientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Patients', key: 'Id' },
      onDelete: 'CASCADE',
    },
    StartDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    EndDate: {
      type: DataTypes.DATEONLY,
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
  await queryInterface.dropTable('Prescriptions');
}
