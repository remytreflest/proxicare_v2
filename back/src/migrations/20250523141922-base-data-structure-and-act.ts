import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
    
  await queryInterface.bulkInsert('Structures', [
      { Name: 'Clinique Saint-Louis', Address: '12 rue de la santé', CreatedAt: new Date(), UpdatedAt: new Date() },
      { Name: 'Hôpital du Centre', Address: '5 avenue du Général', CreatedAt: new Date(), UpdatedAt: new Date() },
      { Name: 'Maison Médicale Belleville', Address: '32 rue des Lilas', CreatedAt: new Date(), UpdatedAt: new Date() },
      { Name: 'Cabinet Infirmier Rivière', Address: '18 impasse du Moulin', CreatedAt: new Date(), UpdatedAt: new Date() },
      { Name: 'Centre Médical Victor Hugo', Address: '2 boulevard Victor Hugo', CreatedAt: new Date(), UpdatedAt: new Date() },
  ]);

  await queryInterface.bulkInsert('HealthcareActs', [
    {
      Name: 'Injection intramusculaire',
      Description: 'Administration d’un médicament par voie intramusculaire',
      Price: 25.5,
      CreatedAt: new Date(),
      UpdatedAt: new Date(),
    },
    {
      Name: 'Prise de sang',
      Description: 'Prélèvement sanguin à domicile',
      Price: 15.0,
      CreatedAt: new Date(),
      UpdatedAt: new Date(),
    },
    {
      Name: 'Pansement simple',
      Description: 'Pose ou changement de pansement',
      Price: 12.0,
      CreatedAt: new Date(),
      UpdatedAt: new Date(),
    },
    {
      Name: 'Perfusion IV',
      Description: 'Pose et surveillance d’une perfusion intraveineuse',
      Price: 35.0,
      CreatedAt: new Date(),
      UpdatedAt: new Date(),
    },
    {
      Name: 'Suivi diabétique',
      Description: 'Mesure glycémie capillaire + injection insuline',
      Price: 22.0,
      CreatedAt: new Date(),
      UpdatedAt: new Date(),
    },
    {
      Name: 'Prise de traitement (Matin)',
      Description: 'Administration de traitement oral sous forme de comprimé(s)',
      Price: 22.0,
      CreatedAt: new Date(),
      UpdatedAt: new Date(),
    },
    {
      Name: 'Prise de traitement (Midi)',
      Description: 'Administration de traitement oral sous forme de comprimé(s)',
      Price: 22.0,
      CreatedAt: new Date(),
      UpdatedAt: new Date(),
    },
    {
      Name: 'Prise de traitement (Soir)',
      Description: 'Administration de traitement oral sous forme de comprimé(s)',
      Price: 22.0,
      CreatedAt: new Date(),
      UpdatedAt: new Date(),
    },
  ]);
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  
    await queryInterface.bulkDelete('HealthcareActs', {});
    await queryInterface.bulkDelete('Structures', {});
}
