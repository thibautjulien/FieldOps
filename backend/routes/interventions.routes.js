import { Router } from "express";
import { listInterventionsController } from "../controllers/interventions.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const interventionsRouter = Router();

interventionsRouter.get("", requireAuth, listInterventionsController);

export default interventionsRouter;
