// MODEL (data) · Scores saved in SQLite.

import * as SQLite from 'expo-sqlite';

import { GameMode } from '../domain/types';

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

/** Opens the database once and creates the scores table on first use. */
function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  databasePromise ??= (async () => {
    const database = await SQLite.openDatabaseAsync('nback.db');
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS scores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        score INTEGER NOT NULL,
        n INTEGER NOT NULL,
        mode TEXT NOT NULL,
        created_at INTEGER NOT NULL
      );
    `);
    return database;
  })();
  return databasePromise;
}

/** Saves one finished round. Values are bound with `?`, never pasted into the SQL string. */
export async function insertScore(entry: { name: string; score: number; n: number; mode: GameMode }): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    'INSERT INTO scores (name, score, n, mode, created_at) VALUES (?, ?, ?, ?, ?)',
    entry.name, entry.score, entry.n, entry.mode, Date.now(),
  );
}

/** Best saved round and who played it (on a tie, whoever got it first), or null when nothing is saved. */
export async function getHighScore(): Promise<{ name: string; score: number } | null> {
  const database = await getDatabase();
  return database.getFirstAsync('SELECT name, score FROM scores ORDER BY score DESC, created_at ASC LIMIT 1');
}
