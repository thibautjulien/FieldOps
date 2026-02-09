import { Router } from "express";
import {
  postAuthLoginController,
  getAuthMeController,
  postAuthRegisterController,
} from "../controllers/auth.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const authRouter = Router();

authRouter.post("/login", postAuthLoginController);
authRouter.get("/me", requireAuth, getAuthMeController);
// ! Route temporaire
authRouter.post("/register", postAuthRegisterController);

export default authRouter;
