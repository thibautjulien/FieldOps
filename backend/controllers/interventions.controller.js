import {
  getInterventionById,
  listInterventions,
  createIntervention,
  updateIntervention,
} from "../services/interventions.service.js";

export async function listInterventionsController(req, res) {
  try {
    const user = req.user;
    const interventions = await listInterventions(user);
    return res.status(200).json(interventions);
  } catch (err) {
    console.error(err);

    if (err.message.startsWith("ROLE_NOT_ALLOWED")) {
      return res.status(403).json({ error: err.message });
    }

    return res.status(500).json({ error: err.message });
  }
}

export async function interventionByIdController(req, res) {
  try {
    const user = req.user;
    const id = req.params.id;
    const intervention = await getInterventionById(id, user);

    return res.status(200).json(intervention);
  } catch (err) {
    console.error(err);

    if (err.message.startsWith("UNAUTHORIZED")) {
      return res.status(401).json({ error: err.message });
    }

    if (err.message.startsWith("NOT_FOUND")) {
      return res.status(404).json({ error: err.message });
    }

    if (err.message.startsWith("FORBIDDEN")) {
      return res.status(403).json({ error: err.message });
    }

    return res.status(500).json({ error: err.message });
  }
}

export async function createInterventionController(req, res) {
  try {
    const user = req.user;
    const data = req.body;

    const newIntervention = await createIntervention(data, user);
    return res.status(201).json(newIntervention);
  } catch (err) {
    console.error(err);

    if (err.message.startsWith("FORBIDDEN")) {
      return res.status(403).json({ error: err.message });
    }

    if (err.message.startsWith("BAD_REQUEST")) {
      res.status(400).json({ error: err.message });
    }

    return res.status(500).json({ error: err.message });
  }
}

export async function updateInterventionController(req, res) {
  try {
    const user = req.user;
    const data = req.body;
    const id = req.params.id;

    const updatedIntervention = await updateIntervention(id, data, user);
    return res.status(200).json(updatedIntervention);
  } catch (err) {
    console.error(err);

    if (err.message.startsWith("FORBIDDEN")) {
      return res.status(403).json({ error: err.message });
    }

    if (err.message.startsWith("NOT_FOUND")) {
      return res.status(404).json({ error: err.message });
    }

    return res.status(500).json({ error: err.message });
  }
}

export async function closeInterventionController(req, res) {
  try {
  } catch (err) {
    console.error(err);

    if (err.message.startsWith("FORBIDDEN")) {
      return res.status(403).json({ error: err.message });
    }

    return res.status(500).json({ error: err.message });
  }
}
