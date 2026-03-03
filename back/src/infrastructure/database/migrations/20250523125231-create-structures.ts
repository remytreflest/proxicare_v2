import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  const tables = (await queryInterface.showAllTables()).map((t) => t.toLowerCase());

  // Table Structures
  if (!tables.includes('structures')) {
    await queryInterface.createTable('Structures', {
      Id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      Name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      Address: {
        type: DataTypes.STRING(255),
        allowNull: false,
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

  // Table d'association
  if (!tables.includes('healthcareprofessionalstructures')) {
    await queryInterface.createTable('HealthcareProfessionalStructures', {
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
      StructureId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Structures',
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
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('HealthcareProfessionalStructures');
  await queryInterface.dropTable('Structures');
}
