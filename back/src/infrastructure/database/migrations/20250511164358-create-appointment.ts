import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.createTable('Appointments', {
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    PatientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Patients',
        key: 'Id',
      },
      onDelete: 'CASCADE',
    },
    HealthcareProfessionalId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'HealthcareProfessionals',
        key: 'Id',
      },
      onDelete: 'CASCADE',
    },
    HealthcareActId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'HealthcareActs',
        key: 'Id',
      },
      onDelete: 'CASCADE',
    },
    Status: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    AppointmentStartDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    AppointmentEndDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    ValidateToken: {
    type: DataTypes.STRING(100),
    allowNull: true,
    },
    ValidateTokenExpiration: {
      type: DataTypes.DATE,
      allowNull: true,
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
  await queryInterface.dropTable('Appointments');
}
