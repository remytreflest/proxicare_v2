import express from 'express';
import { User } from '@/models/User';
import Patient from '@/models/Patient';
import { RolesEnum } from '@/resources/emuns/rolesEnum';
import { SpecialityEnum } from '@/resources/emuns/speciality';
import HealthcareProfessional from '@/models/HealthcareProfessional';
import { joinRoles } from '@/helpers/controllers/registerHelper';
import { addUserRole } from '@/resources/helpers/userHelper';
import { Structure } from '@/models/Structure';

const router = express.Router();

/**
 * @route GET /register/user/:id
 * @description Récupère un utilisateur par son GUID
 * @access Protégé
 */
router.get('/user', async (req: any, res: any) => {
  
  const userId = req.userId;

  try {
    let user = await User.findByPk(userId, {
      include: [
        {
          model: Patient,
          include: [Structure]
        },
        {
          model: HealthcareProfessional,
          include: [
            {
              model: Structure,
              through: { attributes: [] }
            }
          ]
        }
      ]
    });

    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable." });
    }

    return res.status(200).json(user);

  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Erreur serveur." });
  }
});

/**
 * @route POST /register/user
 * @description Crée un nouvel utilisateur dans la base de données avec un rôle générique `USER`.
 * 
 * @access Protégé
 * 
 * @body
 * - id: string (requis) — Identifiant unique fourni par une tierce partie
 * - firstName: string (requis) — Prénom de l'utilisateur
 * - lastName: string (requis) — Nom de l'utilisateur
 * - email: string (requis) — Adresse email de l'utilisateur
 * 
 * @returns
 * - 201 : Utilisateur créé avec succès
 * - 400 : Champs requis manquants
 * - 409 : Conflit — ID ou email déjà utilisé
 * - 500 : Erreur interne du serveur
 */
router.post('/register/user', async (req: any, res: any) => {
  try {
    const auth0Id = req.userId;
    const { firstName, lastName, email } = req.body;
    const roles: RolesEnum[] = [RolesEnum.USER];

    if (!firstName || !lastName || !email ) {
      return res.status(400).json({ message: 'Tous les champs sont requis.' });
    }

    const existingUserId = await User.findOne({ where: { Id: auth0Id } });
    if (existingUserId) {
      return res.status(409).json({ error: 'Un utilisateur avec cet ID existe déjà' });
    }

    const existingUserEmail = await User.findOne({ where: { Email: email } });
    if (existingUserEmail) {
      return res.status(409).json({ message: 'Un utilisateur avec cet email existe déjà.' });
    }

    const newUser = await User.create({
      Id: auth0Id,
      FirstName:firstName,
      LastName:lastName,
      Email: email,
      Roles: joinRoles(roles),
    });

    return res.status(201).json(newUser);
  } 
  catch (error) 
  {
    return res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
});

/**
 * @route POST /register/patient
 * @description Enregistre un nouveau patient dans la base de données à partir d’un utilisateur existant.
 * 
 * @access Protégé
 * 
 * @body
 * - userId: string (requis) — Identifiant de l'utilisateur existant
 * - birthday: string (requis) — Date de naissance du patient (au format ISO)
 * - gender: string (requis) — Sexe du patient (par ex. : "M", "F", etc.)
 * - address: string (requis) — Adresse du patient
 * - socialSecurityNumber: string (requis) — Numéro de sécurité sociale unique
 * 
 * @returns
 * - 201 : Patient enregistré avec succès
 * - 400 : Champs requis manquants
 * - 404 : Utilisateur non trouvé
 * - 409 : Numéro de sécurité sociale déjà enregistré
 * - 500 : Erreur interne du serveur
 */
router.post('/register/patient', async (req: any, res: any) => {
  try {
    const userId = req.userId;
    const { birthday, gender, address, socialSecurityNumber, structureId } = req.body;

    if (!birthday || !gender || !address || !socialSecurityNumber || isNaN(structureId) || structureId <= 0) {
      return res.status(400).json({ message: 'Tous les champs sont requis.' });
    }

    const existingUser = await User.findByPk(userId);

    if (!existingUser) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }

    const existingPatient = await Patient.findOne({ where: { SocialSecurityNumber:socialSecurityNumber } });
    if (existingPatient) {
      return res.status(409).json({ message: 'Un patient avec ce numéro de sécurité sociale existe déjà.' });
    }

    const newPatient = await Patient.create({
      UserId:userId,
      Birthday:birthday,
      Gender:gender,
      Address: address || '', 
      SocialSecurityNumber:socialSecurityNumber,
      StructureId: structureId,
    });

    addUserRole(existingUser, RolesEnum.PATIENT);

    return res.status(201).json({
      message: 'Patient enregistré avec succès.',
      patient: newPatient,
    });
  } 
  catch (error) 
  {
    console.log(error)
    return res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
});

/**
 * @route POST /register/healthcareprofessional
 * @description Enregistre un professionnel de santé (HealthcareProfessional) à partir d’un utilisateur existant.
 * 
 * @access Protégé
 * 
 * @body
 * - userId: string (requis) — Identifiant de l'utilisateur existant
 * - speciality: string (requis) — Spécialité médicale (doit correspondre à une valeur de l'enum SpecialityEnum)
 * 
 * @returns
 * - 201 : Professionnel de soins enregistré avec succès
 * - 400 : Champs requis manquants ou spécialité invalide
 * - 404 : Utilisateur non trouvé
 * - 409 : Un professionnel de santé avec ce UserId existe déjà
 * - 500 : Erreur interne du serveur
 */
router.post('/register/healthcareprofessional', async (req: any, res: any ) => {
  try {
    const userId = req.userId;
    const { speciality, structureId, idn } = req.body;

    if (!speciality || structureId <= 0 || !idn) {
      return res.status(400).json({ message: 'Tous les champs sont requis.' });
    }

    if (!Object.values(SpecialityEnum).includes(speciality)) {
      return res.status(400).json({ message: 'Rôle invalide.' });
    }

    // Vérification que l'utilisateur existe avant de l'associer au patient
    const existingUser = await User.findByPk(userId);
    if (!existingUser) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }

    const existingHealthcareProfessional = await HealthcareProfessional.findOne({ where: { UserId: userId } });
    if (existingHealthcareProfessional) {
      return res.status(409).json({ error: 'Un utilisateur avec cet ID existe déjà' });
    }

    const newHealthcareProfessional = await HealthcareProfessional.create({
      UserId:userId,
      Speciality:speciality,
      StructureId:structureId,
      IDN:idn,
    });

    await newHealthcareProfessional.addStructure(structureId);

    addUserRole(existingUser, RolesEnum.HEALTHCAREPROFESSIONAL);

    return res.status(201).json({
      message: 'Professionnel de soins enregistré avec succès.',
      patient: newHealthcareProfessional ,
    });
  } 
  catch (error) 
  {
    console.log(error)
    return res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
});

export default router;
