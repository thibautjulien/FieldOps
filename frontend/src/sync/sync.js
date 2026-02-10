import { db } from "../db/db";
import { SYNC_STATUS } from "../types/models";
import {
  apiCreateIntervention,
  apiAddInterventionPhoto,
  apiAddInterventionLog,
} from "../api/interventions";
import {
  markInterventionSynced,
  markPhotoSynced,
  markLogSynced,
} from "./queue";

function selectAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        sql,
        params,
        (_tx, result) => {
          const rows = result.rows._array || [];
          resolve(rows);
        },
        (_tx, error) => {
          reject(error);
          return false;
        },
      );
    });
  });
}

export async function runSync() {
  const interventions = await selectAll(
    "SELECT * FROM interventions_local WHERE sync_status = ?",
    [SYNC_STATUS.PENDING],
  );

  for (const it of interventions) {
    const created = await apiCreateIntervention({
      title: it.title,
      description: it.description,
      status: it.status,
      scheduled_at: it.scheduled_at,
      assigned_user_id: it.assigned_user_id,
      latitude: it.latitude,
      longitude: it.longitude,
    });

    await markInterventionSynced(it.id_local, created.id);
  }

  const photos = await selectAll(
    "SELECT * FROM photos_local where sync_status = ?",
    [SYNC_STATUS.PENDING],
  );

  for (const p of photos) {
    const rows = await selectAll(
      "SELECT id_server FROM interventions_local WHERE id_local = ?",
      [p.intervention_id_local],
    );

    const idServer = rows[0]?.id_server;
    if (!idServer) continue;

    await apiAddInterventionPhoto(idServer, {
      type: p.type,
      fileUri: p.file_path_local,
    });

    await markPhotoSynced(p.id_local);
  }

  const logs = await selectAll(
    "SELECT * FROM logs_local WHERE sync_status = ?",
    [SYNC_STATUS.PENDING],
  );

  for (const l of logs) {
    const rows = await selectAll(
      "SELECT id_server FROM interventions_local WHERE id_local = ?",
      [l.intervention_id_local],
    );

    const idServer = rows[0]?.id_server;
    if (!idServer) continue;

    await apiAddInterventionLog(idServer, { action: l.action });
    await markLogSynced(l.id_local);
  }

  console.log("[FieldOps] SYNC done");
}
