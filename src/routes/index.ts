import { Router } from 'express';
import authRouter from './authRouter';
import userRouter from './userRouter';
import healthUnitRouter from './healthUnitRouter';
import specialtyRouter from './specialtyRouter';
import operatingHoursRouter from './operatingHoursRouter';
import favoriteRouter from './FavoritesRouter';
import reviewRouter from './reviewRouter';

const router = Router();

router.use(
  '/',
  authRouter,
  userRouter,
  healthUnitRouter,
  specialtyRouter,
  operatingHoursRouter,
  favoriteRouter,
  reviewRouter 
);
export default router;
