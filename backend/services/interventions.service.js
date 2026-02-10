import Intervention from "../models/Intervention.model.js";
import User from "../models/User.model.js";
import InterventionPhoto from "../models/InterventionPhoto.model.js";
import InterventionLog from "../models/InterventionLog.model.js";

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
  const statusTransition = {
    PLANIFIE: "planifié",
    EN_COURS: "en cours",
    TERMINE: "terminé",
    CLOS: "clos",
  };

  const validTransitions = {
    [statusTransition.PLANIFIE]: [statusTransition.EN_COURS],
    [statusTransition.EN_COURS]: [statusTransition.TERMINE],
    [statusTransition.TERMINE]: [statusTransition.CLOS],
    [statusTransition.CLOS]: [],
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

  const currentStatus = intervention.status;

  if (currentStatus === statusTransition.CLOS) {
    throw new Error("FORBIDDEN: Intervention is closed and cannot be updated");
  }

  if (user.role === "agent" && intervention.assigned_user_id !== user.id) {
    throw new Error("FORBIDDEN: You are not assigned to this intervention");
  }

  if (data.status !== undefined) {
    const nextStatus = data.status;

    if (
      !validTransitions[currentStatus] ||
      !validTransitions[currentStatus].includes(nextStatus)
    ) {
      throw new Error("FORBIDDEN: Invalid status transition");
    }

    intervention.status = nextStatus;
  }

  if (user.role === "agent") {
    if (
      data.title !== undefined ||
      data.description !== undefined ||
      data.scheduled_at !== undefined ||
      data.latitude !== undefined ||
      data.longitude !== undefined
    ) {
      throw new Error("FORBIDDEN: Agents can only modify status");
    }
  }

  if (user.role === "admin") {
    if (data.title != undefined) intervention.title = data.title;
    if (data.description != undefined)
      intervention.description = data.description;
    if (data.scheduled_at != undefined)
      intervention.scheduled_at = data.scheduled_at;
    if (data.latitude != undefined) intervention.latitude = data.latitude;
    if (data.longitude != undefined) intervention.longitude = data.longitude;
  }

  await intervention.save();
  return intervention;
}

export async function closeIntervention(id, user, options = {}) {
  const confirmed = options.confirmed === true;

  const intervention = await Intervention.findByPk(id, {
    attributes: ["id", "status", "assigned_user_id", "is_closed"],
  });

  if (!intervention) throw new Error("NOT_FOUND: Intervention not found");

  if (intervention.is_closed)
    throw new Error("FORBIDDEN: Intervention is already closed");

  if (user.role === "agent") {
    if (intervention.assigned_user_id !== user.id)
      throw new Error("FORBIDDEN: You are not assigned to this intervention");
    if (intervention.status !== "terminé")
      throw new Error("FORBIDDEN: Only finished intervention can be closed");
  } else if (user.role === "admin") {
    if (intervention.status !== "terminé" && !confirmed) {
      throw new Error(
        "FORBIDDEN: Admin must confirm closing a non-finished intervention",
      );
    }
  } else {
    throw new Error("FORBIDDEN: You cannot close this intervention");
  }

  intervention.is_closed = true;
  intervention.status = "clos";
  await intervention.save();
  return intervention;
}

export async function addInterventionPhotos(id, { type, filePath }, user) {
  if (!user) throw new Error("UNAUTHORIZED: Missing or invalid token");
  if (user.role !== "agent")
    throw new Error("FORBIDDEN: Only agents can add photos");

  const intervention = await Intervention.findByPk(id, {
    attributes: ["id", "assigned_user_id", "is_closed"],
  });

  if (!intervention) throw new Error("NOT_FOUND: Intervention not found");
  if (intervention.is_closed)
    throw new Error("FORBIDDEN: Intervention is closed");
  if (intervention.assigned_user_id !== user.id) {
    throw new Error("FORBIDDEN: You are not assigned to this intervention");
  }

  const normalizedType = type?.toUpperCase();
  if (!["AVANT", "APRES"].includes(normalizedType)) {
    throw new Error("BAD_REQUEST: Invalid photo type");
  }
  if (!filePath) throw new Error("BAD_REQUEST: Missing file path");

  const photo = await InterventionPhoto.create({
    intervention_id: id,
    type: normalizedType,
    file_path: filePath,
  });
  return photo;
}
