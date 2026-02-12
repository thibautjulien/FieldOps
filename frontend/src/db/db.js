import { openDatabaseSync } from "expo-sqlite";

export const db = openDatabaseSync("fieldops.db");

export async function execSql(sql, params = []) {
  db.runSync(sql, params);
}

export async function queryAll(sql, params = []) {
  return db.getAllSync(sql, params);
}
