import Patient from '../Patient';
import { User } from '../User';
import Appointment from '../Appointment';
import HealthcareProfessional from '../HealthcareProfessional';
import HealthcareAct from '../HealthcareAct';
import { Structure } from '../Structure';
import { Prescription } from '../Prescription';
import { PrescriptionHealthcareAct } from '../PrescriptionHealthcareAct';

// Fonction pour initialiser les associations
export const initModels = () => {

  Appointment.belongsTo(PrescriptionHealthcareAct, { foreignKey: 'PrescriptionHealthcareActId' });

  // Relations
  User.hasOne(Patient, { foreignKey: 'UserId' });
  User.hasOne(HealthcareProfessional, { foreignKey: 'UserId' });
 
  Patient.belongsTo(User, { foreignKey: 'UserId' });
  Patient.hasMany(Appointment, { foreignKey: 'PatientId' });
  Patient.belongsTo(Structure, { foreignKey: 'StructureId' });
  Patient.hasMany(Prescription, { foreignKey: 'SocialSecurityNumber' });  
  
  HealthcareProfessional.hasMany(Appointment, { foreignKey: 'HealthcareProfessionalId' });
  HealthcareProfessional.belongsTo(User, { foreignKey: 'UserId' });
  HealthcareProfessional.belongsToMany(HealthcareAct, {
    through: 'HealthcareProfessionalHealthcareAct',
    foreignKey: 'HealthcareProfessionalId',
  });
  HealthcareProfessional.belongsToMany(Structure, {
    through: 'HealthcareProfessionalStructures',
    foreignKey: 'HealthcareProfessionalId'
  });

  HealthcareAct.belongsToMany(HealthcareProfessional, {
    through: 'HealthcareProfessionalHealthcareAct',
    foreignKey: 'HealthcareActId',
  });
  HealthcareAct.belongsToMany(Prescription, {
    through: PrescriptionHealthcareAct,
    foreignKey: 'HealthcareActId',
  });

  Structure.belongsToMany(HealthcareProfessional, {
    through: 'HealthcareProfessionalStructures',
    foreignKey: 'StructureId'
  });

  Prescription.belongsTo(Patient, { foreignKey: 'SocialSecurityNumber', targetKey: 'SocialSecurityNumber' })
  Prescription.hasMany(PrescriptionHealthcareAct, { foreignKey: 'PrescriptionId' });
  
  PrescriptionHealthcareAct.belongsTo(Prescription, { foreignKey: 'PrescriptionId' });
  PrescriptionHealthcareAct.belongsTo(HealthcareAct, { foreignKey: 'HealthcareActId' });
  PrescriptionHealthcareAct.hasMany(Appointment, { foreignKey: 'PrescriptionHealthcareActId' });

 return {
    User,
    Patient,
    HealthcareProfessional,
    HealthcareAct,
    Appointment,
    Structure,
    Prescription
  };
};