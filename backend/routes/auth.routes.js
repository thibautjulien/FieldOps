import { Router } from "express";
import { postAuthLoginController, getAuthMeController } from "../controllers/auth.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const authRouter = Router();

authRouter.post("/login", postAuthLoginController);
authRouter.get("/me", requireAuth, getAuthMeController);

export default authRouter;
