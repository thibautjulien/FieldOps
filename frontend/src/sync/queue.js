import { execSql } from "../db/db";
import { SYNC_STATUS } from "../types/models.js";

function nowIso() {
  return new Date().toISOString();
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

  await execSql(
    `
    INSERT INTO intervention_local
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
      nowIso(),
    ],
  );
}

export async function addLocalPhoto(data) {
  const { id_local, intervention_id_local, file_path_local, type } = data;

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
      nowIso(),
    ],
  );
}

export async function addLocalLog(data) {
  const { id_local, intervention_id_local, action } = data;

  await execSql(
    `
        INSERT INTO logs_local
        (id_local, intervention_id_local, action, sync_status, updated_at_local)
        VALUES (?, ?, ?, ?, ?)
        `,
    [id_local, intervention_id_local, action, SYNC_STATUS.PENDING, nowIso()],
  );
}

export async function markInterventionSynced(id_local, id_server) {
  await execSql(
    `
    UPDATE interventions_local
    SET id_server = ?, sync_status = ?, updated_at_local = ? WHERE id_local = ?
    `,
    [id_server, SYNC_STATUS.SYNCED, new Date().toISOString(), id_local],
  );
}

export async function markPhotoSynced(id_local) {
  await execSql(
    `
    UPDATE photos_local
    SET sync_status = ?, updated_at_local = ? WHERE id_local = ?
    `,
    [SYNC_STATUS.SYNCED, new Date().toISOString(), id_local],
  );
}

export async function markLogSynced(id_local) {
  await execSql(
    `
    UPDATE logs_local
    SET sync_status = ?, updated_at_local = ? WHERE id_local = ?
    `,
    [SYNC_STATUS.SYNCED, new Date().toISOString(), id_local],
  );
}
