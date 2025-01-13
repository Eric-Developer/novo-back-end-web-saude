import { Router } from 'express';
import authRouter from './authRouter';
import userRouter from './userRouter';
import healthUnitRouter from './healthUnitRouter';
import specialtyRouter from './specialtyRouter';
import operatingHoursRouter from './operatingHoursRouter';

const router = Router();

router.use(
  '/',
  authRouter,
  userRouter,
  healthUnitRouter,
  specialtyRouter,
  operatingHoursRouter
);
export default router;
