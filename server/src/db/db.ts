import 'dotenv/config';
import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import { Database } from './types.js';

function createDatabase(): Kysely<Database> {
  const url =
    process.env.DATABASE_URL ??
    'postgres://postgres:postgres@localhost:5432/assignment06';
  const pool = new Pool({ connectionString: url });
  return new Kysely<Database>({
    dialect: new PostgresDialect({ pool }),
  });
}

export const db = createDatabase();
