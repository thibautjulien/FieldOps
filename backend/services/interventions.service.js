import Intervention from "../models/Intervention.model.js";
import User from "../models/User.model.js";

export async function listInterventions(user) {
  if (!user) {
    throw new Error("UNAUTHORIZED: Missing or invalid token");
  }

  let whereClause = {};

  if (user.role === "agent") {
    whereClause.assigned_user_id = user.id;
  } else {
    whereClause = {};
  }

  const listInterventions = await Intervention.findAll({
    attributes: ["id", "title", "status", "scheduled_at"],
    where: whereClause,
  });

  return listInterventions;
}

export async function getInterventionById(id, user) {
  if (!user) {
    throw new Error("UNAUTHORIZED: Missing or invalid token");
  }

  const intervention = await Intervention.findByPk(id, {
    attributes: [
      "title",
      "description",
      "status",
      "latitude",
      "longitude",
      "assigned_user_id",
    ],
  });

  if (!intervention) {
    throw new Error("NOT_FOUND: Intervention not found");
  }

  if (user.role === "agent" && intervention.assigned_user_id !== user.id) {
    throw new Error("FORBIDDEN: You are not assigned to this intervention");
  }

  return intervention;
}

export async function createIntervention(data, user) {
  if (user.role !== "admin") {
    throw new Error("FORBIDDEN: Only admins can create interventions");
  }

  const {
    title,
    description,
    status = data.status || "planned",
    latitude,
    longitude,
    assigned_user_id,
    scheduled_at,
  } = data;

  if (
    !title ||
    !description ||
    !status ||
    !latitude ||
    !longitude ||
    !scheduled_at ||
    !assigned_user_id
  ) {
    throw new Error("BAD_REQUEST: Missing required fields");
  }

  const existUser = await User.findByPk(assigned_user_id);
  if (!existUser) {
    throw new Error("BAD_REQUEST: Assigned user does not exist");
  }

  const newIntervention = await Intervention.create({
    title,
    description,
    status,
    latitude,
    longitude,
    assigned_user_id,
    scheduled_at,
  });

  return newIntervention;
}
