import { QueryInterface } from "sequelize";
import { faker } from "@faker-js/faker/locale/fr";
import { v4 as uuidv4 } from "uuid";

const now = () => new Date();
const daysFrom = (n: number) => new Date(Date.now() + n * 86400_000);

function randomDateThisMonth(minOffsetDays = 0): Date {
  const today = new Date();
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const minTime = today.getTime() + minOffsetDays * 86400_000;
  const maxTime = endOfMonth.getTime();
  const safeMax = Math.max(minTime, maxTime);

  return new Date(faker.number.int({ min: minTime, max: safeMax }));
}

function fakeSsn(gender: "M" | "F", index: number): string {
  const genderId = gender === "M" ? "1" : "2";
  const year = String(faker.number.int({ min: 50, max: 99 }));
  const month = String(faker.number.int({ min: 1, max: 12 })).padStart(2, "0");
  const dept = String(faker.number.int({ min: 1, max: 95 })).padStart(2, "0");
  const city = String(faker.number.int({ min: 1, max: 999 })).padStart(3, "0");
  const order = String(index).padStart(3, "0");
  const key = String(faker.number.int({ min: 1, max: 97 })).padStart(2, "0");

  return `${genderId}${year}${month}${dept}${city}${order}${key}`.slice(0, 15);
}

const fakeRpps = () =>
  String(faker.number.int({ min: 10_000_000_000, max: 99_999_999_999 }));

const PATIENT_COUNT = 12;
const NURSE_COUNT = 6;
const DOCTOR_COUNT = 3;
const HP_COUNT = NURSE_COUNT + DOCTOR_COUNT;
const TOTAL_USERS = PATIENT_COUNT + HP_COUNT;
const PRESCRIPTIONS_PER_PATIENT = 2;
const MAX_ACTS_PER_PRESCRIPTION = 3;

export async function up(queryInterface: QueryInterface): Promise<void> {
  faker.seed(42);

  const structures = (
    await queryInterface.sequelize.query(
      'SELECT "Id" FROM "Structures" ORDER BY "Id"',
    )
  )[0] as { Id: number }[];

  const healthcareActs = (
    await queryInterface.sequelize.query(
      'SELECT "Id" FROM "HealthcareActs" ORDER BY "Id"',
    )
  )[0] as { Id: number }[];

  if (structures.length === 0 || healthcareActs.length === 0) {
    throw new Error(
      "Seed requires Structures and HealthcareActs to be present. Run migrations first.",
    );
  }

  const structureIds = structures.map((s) => s.Id);
  const healthcareActIds = healthcareActs.map((a) => a.Id);

  const users = Array.from({ length: TOTAL_USERS }, (_, i) => {
    const isPatient = i < PATIENT_COUNT;
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const role = isPatient ? "USER,PATIENT" : "USER,HEALTHCAREPROFESSIONAL";

    return {
      Id: `auth0|seed${String(i + 1).padStart(4, "0")}`,
      FirstName: firstName,
      LastName: lastName,
      Email: faker.internet.email({ firstName, lastName }).toLowerCase(),
      Roles: role,
      CreatedAt: now(),
      UpdatedAt: now(),
    };
  });

  await queryInterface.bulkInsert("Users", users);

  const genders = ["M", "F"] as const;
  const ssnSet = new Set<string>();
  const patients = users.slice(0, PATIENT_COUNT).map((u, i) => {
    const gender = genders[i % 2];
    let ssn: string;

    do {
      ssn = fakeSsn(gender, i + 1);
    } while (ssnSet.has(ssn));

    ssnSet.add(ssn);

    return {
      UserId: u.Id,
      Birthday: faker.date.birthdate({ min: 18, max: 90, mode: "age" }),
      Gender: gender,
      Address: `${faker.location.streetAddress()}, ${faker.location.city()}`,
      SocialSecurityNumber: ssn,
      StructureId: structureIds[i % structureIds.length],
      CreatedAt: now(),
      UpdatedAt: now(),
    };
  });

  await queryInterface.bulkInsert("Patients", patients);

  const patientRows = (
    await queryInterface.sequelize.query(
      `SELECT "Id", "SocialSecurityNumber" FROM "Patients" WHERE "UserId" LIKE 'auth0|seed%' ORDER BY "Id"`,
    )
  )[0] as { Id: number; SocialSecurityNumber: string }[];

  const hpUsers = users.slice(PATIENT_COUNT);
  const hps = hpUsers.map((u, i) => ({
    UserId: u.Id,
    Speciality: i < NURSE_COUNT ? "NURSE" : "DOCTOR",
    IDN: fakeRpps(),
    StructureId: structureIds[i % structureIds.length],
    CreatedAt: now(),
    UpdatedAt: now(),
  }));

  await queryInterface.bulkInsert("HealthcareProfessionals", hps);

  const hpRows = (
    await queryInterface.sequelize.query(
      `SELECT "Id", "Speciality" FROM "HealthcareProfessionals" WHERE "UserId" LIKE 'auth0|seed%' ORDER BY "Id"`,
    )
  )[0] as { Id: number; Speciality: string }[];

  const hpActLinks: object[] = [];

  for (const hp of hpRows) {
    const eligibleActIds =
      hp.Speciality === "NURSE"
        ? healthcareActIds.slice(0, Math.min(5, healthcareActIds.length))
        : healthcareActIds;

    const shuffled = [...eligibleActIds].sort(() => Math.random() - 0.5);
    const maxPick = Math.max(1, Math.min(4, shuffled.length));
    const selected = shuffled.slice(
      0,
      faker.number.int({ min: 1, max: maxPick }),
    );

    for (const actId of selected) {
      hpActLinks.push({
        HealthcareProfessionalId: hp.Id,
        HealthcareActId: actId,
        CreatedAt: now(),
        UpdatedAt: now(),
      });
    }
  }

  await queryInterface.bulkInsert(
    "HealthcareProfessionalHealthcareActs",
    hpActLinks,
  );

  const nurseHpIds = hpRows
    .filter((h) => h.Speciality === "NURSE")
    .map((h) => h.Id);
  const doctorHpIds = hpRows
    .filter((h) => h.Speciality === "DOCTOR")
    .map((h) => h.Id);

  const prescriptions: object[] = [];

  patientRows.forEach((patient, i) => {
    const count = i % 3 === 0 ? PRESCRIPTIONS_PER_PATIENT : 1;

    for (let p = 0; p < count; p++) {
      const startDate = randomDateThisMonth(p);
      const duration = faker.number.int({ min: 7, max: 28 });
      const endDate = new Date(startDate.getTime() + duration * 86400_000);
      const prescribingHp =
        doctorHpIds.length > 0
          ? doctorHpIds[
              faker.number.int({ min: 0, max: doctorHpIds.length - 1 })
            ]
          : nurseHpIds[0];

      prescriptions.push({
        SocialSecurityNumber: patient.SocialSecurityNumber,
        StartDate: startDate,
        EndDate: endDate,
        HealthcareProfessionalId: prescribingHp,
        CreatedAt: now(),
        UpdatedAt: now(),
      });
    }
  });

  await queryInterface.bulkInsert("Prescriptions", prescriptions);

  const prescriptionRows = (
    await queryInterface.sequelize.query(
      `SELECT p."Id", p."SocialSecurityNumber"
     FROM "Prescriptions" p
     JOIN "Patients" pt ON pt."SocialSecurityNumber" = p."SocialSecurityNumber"
     WHERE pt."UserId" LIKE 'auth0|seed%'
     ORDER BY p."Id"`,
    )
  )[0] as { Id: number; SocialSecurityNumber: string }[];

  const prescriptionActs: object[] = [];

  for (const presc of prescriptionRows) {
    const actCount = faker.number.int({
      min: 1,
      max: MAX_ACTS_PER_PRESCRIPTION,
    });
    const shuffled = [...healthcareActIds].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, actCount);

    for (const actId of selected) {
      const statusWeighted = [
        "TO_BE_PLANNED",
        "TO_BE_PLANNED",
        "PLANNED",
        "PLANNED",
        "PERFORMED",
        "CANCELLED",
      ];
      const status =
        statusWeighted[
          faker.number.int({ min: 0, max: statusWeighted.length - 1 })
        ];
      prescriptionActs.push({
        PrescriptionId: presc.Id,
        HealthcareActId: actId,
        OccurrencesPerDay: faker.number.int({ min: 1, max: 3 }),
        Status: status,
        ValidateToken: status === "PLANNED" ? uuidv4() : null,
        ValidateTokenLimitTime:
          status === "PLANNED"
            ? daysFrom(faker.number.int({ min: 1, max: 7 }))
            : null,
        CreatedAt: now(),
        UpdatedAt: now(),
      });
    }
  }

  await queryInterface.bulkInsert(
    "PrescriptionHealthcareActs",
    prescriptionActs,
  );

  const prescActRows = (
    await queryInterface.sequelize.query(
      `SELECT pha."Id", pha."HealthcareActId", p."SocialSecurityNumber"
     FROM "PrescriptionHealthcareActs" pha
     JOIN "Prescriptions" p ON p."Id" = pha."PrescriptionId"
     JOIN "Patients" pt ON pt."SocialSecurityNumber" = p."SocialSecurityNumber"
     WHERE pt."UserId" LIKE 'auth0|seed%'
     ORDER BY pha."Id"`,
    )
  )[0] as {
    Id: number;
    HealthcareActId: number;
    SocialSecurityNumber: string;
  }[];

  const ssnToPatientId = new Map(
    patientRows.map((p) => [p.SocialSecurityNumber, p.Id]),
  );
  const actToHpIds = new Map<number, number[]>();

  for (const link of hpActLinks as {
    HealthcareProfessionalId: number;
    HealthcareActId: number;
  }[]) {
    const list = actToHpIds.get(link.HealthcareActId) ?? [];

    list.push(link.HealthcareProfessionalId);
    actToHpIds.set(link.HealthcareActId, list);
  }

  const appointments: object[] = [];

  for (const prescAct of prescActRows) {
    if (faker.datatype.boolean(0.8)) {
      const eligibleHps =
        actToHpIds.get(prescAct.HealthcareActId) ?? hpRows.map((h) => h.Id);

      if (eligibleHps.length === 0) continue;

      const hpId =
        eligibleHps[faker.number.int({ min: 0, max: eligibleHps.length - 1 })];
      const patientId = ssnToPatientId.get(prescAct.SocialSecurityNumber);

      if (!patientId) continue;

      const startDate = randomDateThisMonth();
      startDate.setHours(faker.number.int({ min: 8, max: 17 }), 0, 0, 0);
      const endDate = new Date(startDate.getTime() + 30 * 60_000);

      const status = faker.datatype.boolean(0.1) ? "CANCELLED" : "PLANNED";

      appointments.push({
        PatientId: patientId,
        HealthcareProfessionalId: hpId,
        PrescriptionHealthcareActId: prescAct.Id,
        Status: status,
        AppointmentStartDate: startDate,
        AppointmentEndDate: endDate,
        ValidateToken: status === "PLANNED" ? uuidv4() : null,
        ValidateTokenExpiration: status === "PLANNED" ? daysFrom(1) : null,
        CreatedAt: now(),
        UpdatedAt: now(),
      });
    }
  }

  await queryInterface.bulkInsert("Appointments", appointments);

  console.log(`✅  Seeder complete:`);
  console.log(`   • 7 extra structures + 9 extra healthcare acts inserted`);
  console.log(
    `   • ${TOTAL_USERS} users (${PATIENT_COUNT} patients, ${HP_COUNT} healthcare professionals)`,
  );
  console.log(`   • ${hpActLinks.length} HP ↔ Act links`);
  console.log(`   • ${prescriptions.length} prescriptions`);
  console.log(`   • ${prescriptionActs.length} prescription healthcare acts`);
  console.log(`   • ${appointments.length} appointments`);
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  const seededUserIds = (
    await queryInterface.sequelize.query(
      `SELECT "Id" FROM "Users" WHERE "Id" LIKE 'auth0|seed%'`,
    )
  )[0] as { Id: string }[];

  const userIds = seededUserIds.map((u) => `'${u.Id}'`).join(", ");

  if (!userIds) return;

  const patientRows = (
    await queryInterface.sequelize.query(
      `SELECT "Id", "SocialSecurityNumber" FROM "Patients" WHERE "UserId" LIKE 'auth0|seed%'`,
    )
  )[0] as { Id: number; SocialSecurityNumber: string }[];

  const patientIds = patientRows.map((p) => p.Id);
  const ssns = patientRows.map((p) => `'${p.SocialSecurityNumber}'`).join(", ");

  const hpRows = (
    await queryInterface.sequelize.query(
      `SELECT "Id" FROM "HealthcareProfessionals" WHERE "UserId" LIKE 'auth0|seed%'`,
    )
  )[0] as { Id: number }[];

  const hpIds = hpRows.map((h) => h.Id);

  const prescRows =
    patientIds.length > 0
      ? ((
          await queryInterface.sequelize.query(
            `SELECT "Id" FROM "Prescriptions" WHERE "SocialSecurityNumber" IN (${ssns})`,
          )
        )[0] as { Id: number }[])
      : [];
  const prescIds = prescRows.map((p) => p.Id);

  const prescActRows =
    prescIds.length > 0
      ? ((
          await queryInterface.sequelize.query(
            `SELECT "Id" FROM "PrescriptionHealthcareActs" WHERE "PrescriptionId" IN (${prescIds.join(", ")})`,
          )
        )[0] as { Id: number }[])
      : [];
  const prescActIds = prescActRows.map((a) => a.Id);

  if (prescActIds.length > 0)
    await queryInterface.sequelize.query(
      `DELETE FROM "Appointments" WHERE "PrescriptionHealthcareActId" IN (${prescActIds.join(", ")})`,
    );

  if (prescActIds.length > 0)
    await queryInterface.sequelize.query(
      `DELETE FROM "PrescriptionHealthcareActs" WHERE "Id" IN (${prescActIds.join(", ")})`,
    );

  if (prescIds.length > 0)
    await queryInterface.sequelize.query(
      `DELETE FROM "Prescriptions" WHERE "Id" IN (${prescIds.join(", ")})`,
    );

  if (hpIds.length > 0)
    await queryInterface.sequelize.query(
      `DELETE FROM "HealthcareProfessionalHealthcareActs" WHERE "HealthcareProfessionalId" IN (${hpIds.join(", ")})`,
    );

  if (hpIds.length > 0)
    await queryInterface.sequelize.query(
      `DELETE FROM "HealthcareProfessionals" WHERE "Id" IN (${hpIds.join(", ")})`,
    );

  if (patientIds.length > 0)
    await queryInterface.sequelize.query(
      `DELETE FROM "Patients" WHERE "Id" IN (${patientIds.join(", ")})`,
    );

  if (userIds)
    await queryInterface.sequelize.query(
      `DELETE FROM "Users" WHERE "Id" IN (${userIds})`,
    );
}
