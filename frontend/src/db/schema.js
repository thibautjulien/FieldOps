import { execSql, queryAll } from "./db";

export async function initSchema() {
  await execSql(`
        CREATE TABLE IF NOT EXISTS interventions_local (
        id_local TEXT PRIMARY KEY,
        id_server INTEGER,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        status TEXT NOT NULL,
        scheduled_at TEXT NOT NULL,
        latitude REAL,
        longitude REAL,
        city_label TEXT,
        assigned_user_id INTEGER,
        sync_status TEXT NOT NULL,
        updated_at_local TEXT NOT NULL);`);

  await execSql(`
            CREATE TABLE IF NOT EXISTS photos_local (
            id_local TEXT PRIMARY KEY,
            intervention_id_local TEXT NOT NULL,
            file_path_local TEXT NOT NULL,
            type TEXT NOT NULL,
            sync_status TEXT NOT NULL,
            updated_at_local TEXT NOT NULL);`);

  await execSql(`
            CREATE TABLE IF NOT EXISTS logs_local (
            id_local TEXT PRIMARY KEY,
            intervention_id_local TEXT NOT NULL,
            action TEXT NOT NULL,
            sync_status TEXT NOT NULL,
            updated_at_local TEXT NOT NULL);`);

  await execSql(`
  CREATE TABLE IF NOT EXISTS sync_queue (
    id_local TEXT PRIMARY KEY,
    entity_type TEXT NOT NULL,
    entity_id_local TEXT NOT NULL,
    payload_json TEXT NOT NULL,
    sync_status TEXT NOT NULL,
    created_at_local TEXT NOT NULL,
    updated_at_local TEXT NOT NULL
  );
`);


  const columns = await queryAll("PRAGMA table_info(interventions_local)");
  const hasCityLabel = columns.some((col) => col.name === "city_label");

  if (!hasCityLabel) {
    await execSql("ALTER TABLE interventions_local ADD COLUMN city_label TEXT");
  }

}
