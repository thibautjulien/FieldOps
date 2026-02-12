import { execSql } from "../db/db";
import { SYNC_STATUS } from "../types/models.js";

function nowIso() {
  return new Date().toISOString();
}

function makeId(prefix = "loc") {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export async function enqueueAction(entityType, entityIdLocal, payload) {
  const idLocal = makeId("queue");
  const now = nowIso();

  await execSql(
    `
    INSERT INTO sync_queue 
    (id_local, entity_type, entity_id_local, payload_json, sync_status, created_at_local, updated_at_local)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [
      idLocal,
      entityType,
      entityIdLocal,
      JSON.stringify(payload),
      SYNC_STATUS.PENDING,
      now,
      now,
    ],
  );

  return idLocal;
}

export async function addLocalIntervention(data) {
  const {
    id_local,
    title,
    description,
    status,
    scheduled_at,
    assigned_user_id = null,
    latitude = null,
    longitude = null,
  } = data;

  const now = nowIso();

  await execSql(
    `
    INSERT INTO interventions_local
    (id_local, title, description, status, scheduled_at, assigned_user_id, latitude, longitude, sync_status, updated_at_local)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      id_local,
      title,
      description,
      status,
      scheduled_at,
      assigned_user_id,
      latitude,
      longitude,
      SYNC_STATUS.PENDING,
      now,
    ],
  );

  await enqueueAction("INTERVENTION_CREATE", id_local, {
    id_local,
    title,
    description,
    status,
    scheduled_at,
    assigned_user_id,
    latitude,
    longitude,
  });
}

export async function addLocalStatusChange({ intervention_id_local, status }) {
  const now = nowIso();

  await execSql(
    `
    UPDATE interventions_local
    SET status = ?, sync_status = ?, updated_at_local = ? 
    WHERE id_local = ?
    `,
    [status, SYNC_STATUS.PENDING, now, intervention_id_local],
  );

  await enqueueAction("STATUS", intervention_id_local, {
    intervention_id_local,
    status,
  });
}

export async function addLocalPhoto(data) {
  const { id_local, intervention_id_local, file_path_local, type } = data;
  const now = nowIso();

  await execSql(
    `
        INSERT INTO photos_local
        (id_local, intervention_id_local, file_path_local, type, sync_status, updated_at_local)
        VALUES (?, ?, ?, ?, ?, ?)
        `,
    [
      id_local,
      intervention_id_local,
      file_path_local,
      type,
      SYNC_STATUS.PENDING,
      now,
    ],
  );

  await enqueueAction("PHOTO", id_local, {
    intervention_id_local,
    file_path_local,
    type,
  });
}

export async function addLocalLog(data) {
  const { id_local, intervention_id_local, action } = data;
  const now = nowIso();

  await execSql(
    `
        INSERT INTO logs_local
        (id_local, intervention_id_local, action, sync_status, updated_at_local)
        VALUES (?, ?, ?, ?, ?)
        `,
    [id_local, intervention_id_local, action, SYNC_STATUS.PENDING, now],
  );

  await enqueueAction("LOG", id_local, {
    intervention_id_local,
    action,
  });
}

export async function markInterventionSynced(id_local, id_server) {
  await execSql(
    `
    UPDATE interventions_local
    SET id_server = ?, sync_status = ?, updated_at_local = ? WHERE id_local = ?
    `,
    [id_server, SYNC_STATUS.SYNCED, nowIso(), id_local],
  );
}

export async function markPhotoSynced(id_local) {
  await execSql(
    `
    UPDATE photos_local
    SET sync_status = ?, updated_at_local = ? WHERE id_local = ?
    `,
    [SYNC_STATUS.SYNCED, nowIso(), id_local],
  );
}

export async function markLogSynced(id_local) {
  await execSql(
    `
    UPDATE logs_local
    SET sync_status = ?, updated_at_local = ? WHERE id_local = ?
    `,
    [SYNC_STATUS.SYNCED, nowIso(), id_local],
  );
}

export async function markQueueSynced(id_local) {
  await execSql(
    `
    UPDATE sync_queue
    SET sync_status = ?, updated_at_local = ?
    WHERE id_local = ?
    `,
    [SYNC_STATUS.SYNCED, nowIso(), id_local],
  );
}

export async function markQueueFaield(id_local) {
  await execSql(
    `
    UPDATE sync_queue
    SET sync_status = ?, updated_at_local = ?
    WHERE id_local = ?
    `,
    [SYNC_STATUS.FAILED, nowIso(), id_local],
  );
}
