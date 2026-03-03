import Appointment from '@/infrastructure/database/models/Appointment.model';
import { IAppointmentRepository } from '@/domain/repositories/IAppointmentRepository';
import { Op } from 'sequelize';

export class AppointmentRepository implements IAppointmentRepository {
  async findAllForUser(patientId?: number, professionalId?: number): Promise<Appointment[]> {
    const conditions: any[] = [];
    if (patientId) conditions.push({ PatientId: patientId });
    if (professionalId) conditions.push({ HealthcareProfessionalId: professionalId });

    return Appointment.findAll({
      where: { [Op.or]: conditions },
      order: [['AppointmentStartDate', 'ASC']],
    });
  }

  async findById(id: number): Promise<Appointment | null> {
    return Appointment.findOne({ where: { Id: id } });
  }

  async create(data: {
    PatientId: number;
    HealthcareProfessionalId: number;
    PrescriptionHealthcareActId: number;
    Status: string;
    AppointmentStartDate: string;
    AppointmentEndDate: string;
  }): Promise<Appointment> {
    return Appointment.create(data);
  }

  async delete(appointment: Appointment): Promise<void> {
    await appointment.destroy();
  }
}
