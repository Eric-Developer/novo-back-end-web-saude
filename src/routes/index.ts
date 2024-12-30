import { Router } from "express";
import authRouter from "./authRouter";
import userRouter from "./userRouter";
import healthUnitRouter from "./healthUnitRouter";
import specialtyRouter from "./specialtyRouter";

const router = Router()


router.use("/",authRouter,userRouter,healthUnitRouter,specialtyRouter)
export default router