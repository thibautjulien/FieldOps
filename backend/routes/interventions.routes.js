import { Router } from "express";
import {
  listInterventionsController,
  interventionByIdController,
  createInterventionController,
  updateInterventionController,
} from "../controllers/interventions.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";

const interventionsRouter = Router();

interventionsRouter.get("", requireAuth, listInterventionsController);
interventionsRouter.get("/:id", requireAuth, interventionByIdController);
interventionsRouter.post(
  "",
  requireAuth,
  requireRole("admin"),
  createInterventionController,
);
interventionsRouter.put("/:id", requireAuth, updateInterventionController);

export default interventionsRouter;
