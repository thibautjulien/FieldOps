import { Router } from "express";
import {
  getUserMeController,
  putUserMeController,
  getAgentsController,
} from "../controllers/user.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";

const userRouter = Router();

userRouter.get("/me", requireAuth, getUserMeController);
userRouter.put("/me", requireAuth, putUserMeController);
userRouter.get(
  "/agents",
  requireAuth,
  requireRole("admin"),
  getAgentsController,
);

export default userRouter;
