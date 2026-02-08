import { listInterventions } from "../services/interventions.service.js";

export async function listInterventionsController(req, res) {
  try {
    const user = req.user;
    const interventions = await listInterventions(user);
    return res.status(200).json(interventions);
  } catch (err) {
    console.error(err);

    if (err.message.startsWith("ROLE_NOT_ALLOWED")) {
      return res.status(403).json({ error: "This endpoint is not implemented for your role" });
    }

    return res.status(500).json({ error: "Internal error" });
  }
}

export async function interventionByIdController(req, res) {}
