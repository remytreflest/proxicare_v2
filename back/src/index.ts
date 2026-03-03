import app from '@/app';
import http from 'http';
import sequelize from '@/infrastructure/config/database';
import { initModels } from '@/infrastructure/database/models';

const PORT = process.env.PORT || 3000;

// Initialiser les modèles Sequelize
initModels();

// Synchroniser la base de données
sequelize.sync()
  .then(() => console.log('Database synced with models'))
  .catch((err) => console.error('Error syncing database:', err));

// Démarrer le serveur HTTP
http.createServer(app).listen(PORT, () => {
  console.log(`Serveur HTTP démarré sur http://localhost:${PORT}`);
});
