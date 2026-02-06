import Intervention from "../models/Intervention.model.js";

export async function listInterventions(user) {
  // Les autres rôles ne sont pas encore pris en charge - TEMPORAIRE
  if (user.role !== "agent") {
    throw new Error("ROLE_NOT_ALLOWED : Not implemented for this role");
  }

  return Intervention.findAll({
    attributes: ["id", "title", "status", "scheduled_at"],
    where: { assigned_user_id: user.id },
  });
}
