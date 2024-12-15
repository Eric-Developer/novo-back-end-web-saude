import { Router } from "express";
import authRouter from "./authRouter";
import userRouter from "./userRouter";

const router = Router()


router.use("/",authRouter,userRouter)
export default router