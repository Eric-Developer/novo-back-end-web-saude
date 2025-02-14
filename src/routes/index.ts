import { Router } from 'express';
import authRouter from './authRouter';
import userRouter from './userRouter';
import healthUnitRouter from './healthUnitRouter';
import specialtyRouter from './specialtyRouter';
import operatingHoursRouter from './operatingHoursRouter';
import favoriteRouter from './FavoritesRouter';

const router = Router();

router.use(
  '/',
  authRouter,
  userRouter,
  healthUnitRouter,
  specialtyRouter,
  operatingHoursRouter,
  favoriteRouter
);
export default router;
