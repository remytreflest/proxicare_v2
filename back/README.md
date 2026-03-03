# 🏥 Proxicare API

API REST pour la gestion des soins médicaux à domicile.

## 📋 Table des matières

- [Fonctionnalités](#-fonctionnalités)
- [Stack technique](#-stack-technique)
- [Installation](#-installation)
- [Documentation API (Swagger)](#-documentation-api-swagger)
- [Variables d'environnement](#-variables-denvironnement)
- [Structure du projet](#-Structure-du-projet)
- [Authentification](#-Authentification)

## ✨ Fonctionnalités

- **Gestion des utilisateurs** : Inscription patients et professionnels de santé
- **Gestion des prescriptions** : Création et suivi des prescriptions médicales
- **Gestion des rendez-vous** : Planification des soins à domicile
- **Validation par QR Code** : Confirmation des soins réalisés
- **Gestion des actes de soins** : Catalogue des actes disponibles

## 🛠 Stack technique

- **Runtime** : Node.js 20+
- **Framework** : Express.js
- **Langage** : TypeScript
- **ORM** : Sequelize
- **Base de données** : PostgreSQL
- **Authentification** : Auth0 (JWT)
- **Documentation** : Swagger/OpenAPI 3.0
- **Conteneurisation** : Docker & Docker Compose
- **Tests** : Jest & Supertest

## 🚀 Installation

### Prérequis

- Node.js 18+
- npm

### Installation

```bash
# Cloner le dépôt
git clone <repository-url>
cd nodejs-api

# non nécessaire vu que l'on déploie sur docker mais utile pour éviter les erreurs visuelles dans le code car dépendances non installées
npm install

# Être dans le répertoire d'installation
# Avoir docker desktop opérationnel

# Build et déployer l'api et la base de donnée
docker-compose up -d --build

# Lancer la migration de la base de données pour obtenir un état initial
docker-compose exec api npx sequelize-cli db:migrate
```

L'API sera accessible sur `http://localhost:3000`

```bash
# Revenir à un état initial (avec suppression du volumes de la bdd)
docker-compose down -v
```

```bash
# Lancer avec l'interface pgadmin pour se connecter visuellement à la base de données :
docker-compose --profile dev up -d

# Aller sur localhost:5050
# Créer une connexion à un nouveau serveur :
# Name	proxicare
# Host	postgres
# Port	5432
# Maintenance database	proxicare
# Username	DB_USER (.env)
# Password	DB_PASSWORD (.env)
```




## 🐳 Docker Logs

# API
docker logs -f proxicare-api

# Base de données PostgreSQL
docker logs -f proxicare-postgres


## 📚 Documentation API (Swagger)

La documentation interactive de l'API est disponible via Swagger UI :

- **URL** : `http://localhost:3000/api-docs`
- **JSON OpenAPI** : `http://localhost:3000/api-docs.json`

# MODE DEBUG

Dans le .env, mettez la variable DEBUG=true
Impacts : 
-> Logs de retour en cas d'erreur plus clair
-> Balise header Xuser-Id override par défaut : 123456
    - Cela permet d'utiliser l'API sans nécessité de brancher le front (néanmoins besoin de faire l'étape de créer un utilisateur via la route api toujours nécessaire)
-> Les utilisateurs crées ont automatiquement le rôle ADMIN


## ⚙️ Variables d'environnement

| Variable | Description | Défaut |
|----------|-------------|--------|
| `NODE_ENV` | Environnement (development/production) | development |
| `PORT` | Port de l'API | 3000 |
| `DB_HOST` | Hôte PostgreSQL | localhost |
| `DB_PORT` | Port PostgreSQL | 5432 |
| `DB_NAME` | Nom de la base | proxicare |
| `DB_USER` | Utilisateur BDD | proxicare |
| `DB_PASSWORD` | Mot de passe BDD | - |
| `AUTH0_DOMAIN` | Domaine Auth0 | - |
| `AUTH0_AUDIENCE` | Audience Auth0 | - |
| `API_CORS` | Origines CORS autorisées | - |

## 📁 Structure du projet

```
src/
├── shared/                        ← utilitaires sans dépendance
│   ├── enums/                     (4 fichiers, depuis resources/emuns/)
│   └── helpers/                   (3 fichiers, depuis helpers/ et resources/helpers/)
│
├── domain/                        ← règles métier pures
│   ├── entities/                  (7 interfaces TypeScript)
│   └── repositories/              (9 interfaces — contrats de l'accès aux données)
│
├── application/use-cases/         ← logique métier extraite des controllers
│   ├── register/                  (4 use cases)
│   ├── healthcare/                (6 use cases)
│   ├── prescription/              (3 use cases)
│   ├── appointment/               (3 use cases)
│   ├── qrcode/                    (2 use cases)
│   └── structure/                 (1 use case)
│
├── infrastructure/                ← tout ce qui touche à l'extérieur
│   ├── config/                    (database.ts + swagger.ts)
│   ├── database/
│   │   ├── models/                (10 modèles Sequelize *.model.ts + associations)
│   │   ├── repositories/          (9 implémentations Sequelize des interfaces domain)
│   │   └── migrations/            (copiées depuis src/migrations/)
│   └── container.ts               (singletons injectés dans les controllers)
│
└── interfaces/http/               ← couche HTTP uniquement
    ├── controllers/               (6 controllers allégés *.controller.ts)
    ├── middlewares/               (2 middlewares déplacés)
    └── routes/index.ts            (agrégation des routes)
```

## 🔒 Authentification

L'API utilise Auth0 pour l'authentification JWT. Chaque requête doit inclure :

- **Header `Authorization`** : `Bearer <token>`
- **Header `X-Userid`** : ID de l'utilisateur Auth0

## 📝 Licence

MIT
