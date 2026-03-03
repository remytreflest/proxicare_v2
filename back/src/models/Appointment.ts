import { Model, DataTypes } from 'sequelize';
import sequelize from '@/config/database';
import { AppointmentsStatusEnum } from '@/resources/emuns/appointmentsStatus';

class Appointment extends Model {
  public Id!: number;
  public PatientId!: number;
  public HealthcareProfessionalId!: number;
  public HealthcareActId!: number;
  public Status!: AppointmentsStatusEnum;
  public AppointmentStartDate!: Date;
  public AppointmentEndDate!: Date;
  public ValidateToken?: string;
  public ValidateTokenExpiration?: Date;
  public CreatedAt!: Date;
  public UpdatedAt!: Date;
}

Appointment.init({
  Id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  PatientId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  HealthcareProfessionalId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  PrescriptionHealthcareActId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  Status: {
    type: DataTypes.ENUM(...Object.values(AppointmentsStatusEnum)),
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
  }
}, {
  sequelize,
  modelName: 'Appointment',
  tableName: 'Appointments',
  timestamps: true,
  createdAt: 'CreatedAt',
  updatedAt: 'UpdatedAt',
});

export default Appointment;
