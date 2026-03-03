import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.createTable('Patients', {
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    UserId: {
      type: DataTypes.STRING(64),
      allowNull: false,
      references: {
        model: 'Users',  // nom de la table référencée
        key: 'Id',
      },
      onDelete: 'CASCADE',
    },
    Birthday: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    Gender: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    Address: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    SocialSecurityNumber: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
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

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('Patients');
}
