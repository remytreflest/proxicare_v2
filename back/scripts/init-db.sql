-- ==================================
-- Script d'initialisation de la base de données Proxicare
-- ==================================

-- Créer les extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE 'Base de données Proxicare initialisée avec succès.';
    RAISE NOTICE 'Les migrations Sequelize seront exécutées au démarrage de l''API.';
END $$;
