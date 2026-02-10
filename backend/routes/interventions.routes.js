import { Router } from "express";
import {
  listInterventionsController,
  interventionByIdController,
  createInterventionController,
  updateInterventionController,
  closeInterventionController,
  addInterventionPhotosController,
} from "../controllers/interventions.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import upload from "../middlewares/upload.middleware.js";

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
interventionsRouter.put("/:id/close", requireAuth, closeInterventionController);
interventionsRouter.post(
  "/:id/photos",
  requireAuth,
  upload.single("photo"),
  addInterventionPhotosController,
);

export default interventionsRouter;
