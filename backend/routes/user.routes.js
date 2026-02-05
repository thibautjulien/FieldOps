import { Router } from "express";
import { getUserMeController, putUserMeController } from "../controllers/user.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const userRouter = Router();

userRouter.get("/me", requireAuth, getUserMeController);
userRouter.put("/me", requireAuth, putUserMeController);

export default userRouter;
