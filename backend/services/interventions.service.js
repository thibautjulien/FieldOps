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
    status = data.status || "planifié",
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

export async function updateIntervention(id, data, user) {
  const validTransitions = {
    planifié: ["en cours"],
    "en cours": ["terminé"],
    terminé: ["clos"],
    clos: [],
  };

  const intervention = await Intervention.findByPk(id, {
    attributes: [
      "id",
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

  if (intervention.is_closed) {
    throw new Error("FORBIDDEN: Intervention is closed and cannot be modified");
  }

  if (user.role === "agent" && intervention.assigned_user_id !== user.id) {
    throw new Error("FORBIDDEN: You are not assigned to this intervention");
  }

  if (user.role === "agent") {
    if (data.title !== undefined) {
      throw new Error("FORBIDDEN: Agents can only modify status");
    }
    if (data.description !== undefined) {
      throw new Error("FORBIDDEN: Agents can only modify status");
    }
    if (data.scheduled_at !== undefined) {
      throw new Error("FORBIDDEN: Agents can only modify status");
    }
    if (data.latitude !== undefined) {
      throw new Error("FORBIDDEN: Agents can only modify status");
    }
    if (data.longitude !== undefined) {
      throw new Error("FORBIDDEN: Agents can only modify status");
    }

    if (!validTransitions[intervention.status].includes(data.status)) {
      throw new Error("FORBIDDEN: Invalid status transition");
    }
    intervention.status = data.status;
  }

  if (user.role === "admin") {
    if (data.title !== undefined) intervention.title = data.title;
    if (data.description !== undefined)
      intervention.description = data.description;
    if (data.scheduled_at !== undefined)
      intervention.scheduled_at = data.scheduled_at;
    if (data.latitude !== undefined) intervention.latitude = data.latitude;
    if (data.longitude !== undefined) intervention.longitude = data.longitude;
  }

  await intervention.save();
  return intervention;
}

async function closeIntervention(id, user) {
  const intervention = await Intervention.findByPk(id, {
    attributes: ["id", "status", "assigned_user_id", "is_closed"],
  });

  if (!intervention) {
    throw new Error("NOT_FOUND: Intervention not found");
  }

  if (intervention.is_closed) {
    throw new Error("FORBIDDEN: Intervention is already closed");
  }

  if (user.role === "admin") {
    if (intervention.status !== "terminé" && !options.confirmed) {
      throw new Error(
        "BAD_REQUEST: Admin must confirm closing a non-finished intervention");
    }
  } else if (
    user.role === "agent" &&
    intervention.assigned_user_id === user.id
  ) {
    if (intervention.assigned_user_id !== user.id)
      throw new Error("FORBIDDEN: You are not assigned to this intervention");
    if (intervention.status !== "terminé")
      throw new Error(
        "FORBIDDEN: Only interventions with status 'terminé' can be closed",
      );
  } else {
    throw new Error("FORBIDDEN: You cannot close this intervention");
  }
}
