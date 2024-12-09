import app from './index';
import AppDataSource from './database/config';

const PORT = process.env.PORT || 3001;

const startServer = async () => {
  try {
    await AppDataSource.initialize();
    console.log('Database OK');

    app.listen(PORT, () => {
      console.log(`Servidor rodando em http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Erro ao inicializar o Data Source:', error);
  }
};

startServer();
