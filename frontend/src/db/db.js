import { openDatabaseSync } from "expo-sqlite";

export const db = openDatabaseSync("fieldops.db");

export function execSql(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        sql,
        params,
        () => resolve(),
        (_tx, error) => {
          reject(error);
          return false;
        },
      );
    });
  });
}
