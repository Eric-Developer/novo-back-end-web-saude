import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.PG_HOST,
  port: parseInt(process.env.PG_PORT || '5432'),
  username: process.env.PG_USUARIO,
  password: process.env.PG_SENHA,
  database: process.env.PG_BANCO,
  synchronize: true,
  logging: true,
  entities: [`${__dirname}/../models/*.{js,ts}`],
  subscribers: [],
});

export default AppDataSource;
