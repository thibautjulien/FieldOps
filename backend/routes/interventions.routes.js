import { Router } from "express";
import {
  listInterventionsController,
  interventionByIdController,
  createInterventionController,
  updateInterventionController,
  closeInterventionController,
  addInterventionPhotosController,
  getInterventionPhotosController,
  addInterventionLogController,
  getInterventionLogController,
} from "../controllers/interventions.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import upload from "../middlewares/upload.middleware.js";

const interventionsRouter = Router();

// LISTE
interventionsRouter.get("", requireAuth, listInterventionsController);
interventionsRouter.get("/:id", requireAuth, interventionByIdController);

// AJOUT
interventionsRouter.post(
  "",
  requireAuth,
  requireRole("admin"),
  createInterventionController,
);

// MODIFICATION
interventionsRouter.put("/:id", requireAuth, updateInterventionController);

// CLÔTURE
interventionsRouter.put("/:id/close", requireAuth, closeInterventionController);

// PHOTOS
interventionsRouter.post(
  "/:id/photos",
  requireAuth,
  upload.single("photo"),
  addInterventionPhotosController,
);
interventionsRouter.get(
  "/:id/photos",
  requireAuth,
  getInterventionPhotosController,
);

// LOGS
interventionsRouter.post(
  "/:id/logs",
  requireAuth,
  addInterventionLogController,
);
interventionsRouter.get("/:id/logs", requireAuth, getInterventionLogController);

export default interventionsRouter;
