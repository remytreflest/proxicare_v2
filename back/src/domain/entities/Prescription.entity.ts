export interface IPrescription {
  Id: number;
  SocialSecurityNumber: string;
  StartDate: Date;
  EndDate: Date;
  HealthcareProfessionalId?: number | null;
}

export interface IPrescriptionActInput {
  id: number;
  occurrencesPerDay: number;
}
