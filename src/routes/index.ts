import { Router } from 'express';
import authRouter from './authRouter';
import userRouter from './userRouter';
import healthUnitRouter from './healthUnitRouter';
import specialtyRouter from './specialtyRouter';
import operatingHoursRouter from './operatingHoursRouter';
import favoriteRouter from './FavoritesRouter';
import reviewRouter from './reviewRouter';
import healthUnitImageRouter from './healthUnitImageRouter';

const router = Router();

router.use(
  '/',
  authRouter,
  userRouter,
  healthUnitRouter,
  specialtyRouter,
  operatingHoursRouter,
  favoriteRouter,
  reviewRouter,
  healthUnitImageRouter
);
export default router;
