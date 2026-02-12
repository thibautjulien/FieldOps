import { queryAll } from "../db/db";
import { api } from "../api/client";
import {
  markInterventionSynced,
  markPhotoSynced,
  markLogSynced,
  markQueueSynced,
  markQueueFailed,
} from "./queue";

function parsePayload(payloadJson) {
  try {
    return JSON.parse(payloadJson);
  } catch {
    return null;
  }
}

async function getServerInterventionId(interventionIdLocal) {
  const rows = await queryAll(
    "SELECT id_server FROM intervention_local WHERE id_local = ?",
    [interventionIdLocal],
  );
  return rows[0]?.id_server || null;
}

export async function runSync() {
  const queueItems = await queryAll(`
    SELECT * FROM sync_queue
    WHERE sync_status = 'PENDING'
    ORDER BY created_at_local ASC`);

  for (const item of queueItems) {
    const payload = parsePayload(item.payload_json);

    if (!payload) {
      await markQueueFailed(item.id_local);
      continue;
    }

    try {
      if (item.entity_type === "INTERVENTION_CREATE") {
        const created = await api.post("/interventions", {
          title: payload.title,
          description: payload.description,
          status: payload.status,
          scheduled_at: payload.scheduled_at,
          assigned_user_id: payload.assigned_user_id,
          latitude: payload.latitude,
          longitude: payload.longitude,
        });

        await markInterventionSynced(payload.id_local, created.data.id);
        await markQueueSynced(item.id_local);
        continue;
      }

      if (item.entity_type === "STATUS") {
        const idServer = await getServerInterventionId(
          payload.intervention_id_local,
        );
        if (!idServer) {
          await markQueueFailed(item.id_local);
          continue;
        }

        await api.put(`/interventions/${idServer}`, { status: payload.status });
        await markQueueSynced(item.id_local);
        continue;
      }

      if (item.entity_type === "PHOTO") {
        const idServer = await getServerInterventionId(
          payload.intervention_id_local,
        );
        if (!idServer) {
          await markQueueFailed(item.id_local);
          continue;
        }

        const form = new FormData();
        form.append("type", payload.type);
        form.append("photo", {
          uri: payload.file_path_local,
          name: "photo.jpg",
          type: "image/jpeg",
        });

        await api.post(`/interventions/${idServer}/photos`, form, {
          headers: { "Content-Type": "multipart/form-date" },
        });

        await markPhotoSynced(item.entity_id_local);
        await markQueueSynced(item.id_local);
        continue;
      }

      if (item.entity_type === "LOG") {
        const idServer = await getServerInterventionId(
          payload.intervention_id_local,
        );
        if (!idServer) {
          await markQueueFailed(item.id_local);
          continue;
        }

        await api.post(`/interventions/${idServer}/logs`, {
          action: payload.action,
        });

        await markLogSynced(item.entity_id_local);
        await markQueueSynced(item.id_local);
        continue;
      }

      await markQueueFailed(item.id_local);
    } catch (err) {
      console.error("[FieldOps] Sync error : ", item.entity_type, err?.message);
      await markQueueFailed(item.id_local);
    }
  }
}
