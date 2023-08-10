import dotenv from 'dotenv';
import { readFile } from 'fs/promises';

import pg, { QueryResult } from 'pg';
// import { Event } from '../routes/event.js';
import { Speaker } from '../routes/speaker.js';

import { User } from '../routes/user.js';
import { Event, Registration } from '../types.js';
import { toPositiveNumberOrDefault } from './toPositiveNumberOrDefault.js';
dotenv.config();

const SCHEMA_FILE = './sql/schema.sql';
const DROP_SCHEMA_FILE = './sql/drop.sql';

export async function createSchema(schemaFile = SCHEMA_FILE) {
  const data = await readFile(schemaFile);

  return query(data.toString('utf-8'));
}

export async function dropSchema(dropFile = DROP_SCHEMA_FILE) {
  const data = await readFile(dropFile);

  return query(data.toString('utf-8'));
}

const { DATABASE_URL: connectionString } = process.env;
// Notum SSL tengingu við gagnagrunn ef við erum *ekki* í development
// mode, á heroku, ekki á local vél

const pool = new pg.Pool({ connectionString });

pool.on('error', (err: Error) => {
  console.error('Villa í tengingu við gagnagrunn, forrit hættir', err);
  process.exit(-1);
});

export type QueryInput = string | number | boolean | undefined;
export type QueryTypes = User | Event | Speaker | Registration;

export async function query(q: string, values: Array<QueryInput> = []) {
  let client;
  console.log("í query í db.ts")
  try {
    console.log("í try í query")
    client = await pool.connect();
    console.log("Pool er: ", pool)
  } catch (e) {
    console.log("í error í query")
    console.error('unable to get client from pool', e);
    return null;
  }

  try {
    const result = await client.query(q, values);
    return result;
  } catch (e) {

    return null;
  } finally {
    client.release();
  }
}

export async function pagedQuery(
  sqlQuery: string,
  values: Array<QueryInput> = [],
  { offset = 0, limit = 10 } = {}
): Promise<QueryResult<QueryTypes> | null> {
  const sqlLimit = values.length + 1;
  const sqlOffset = values.length + 2;
  const q = `${sqlQuery} LIMIT $${sqlLimit} OFFSET $${sqlOffset}`;

  const limitAsNumber = toPositiveNumberOrDefault(limit, 10);
  const offsetAsNumber = toPositiveNumberOrDefault(offset, 0);

  const combinedValues = values.concat([limitAsNumber, offsetAsNumber]);

  const result = await query(q, combinedValues);
  // console.log("hahaha", result.rows)
  if (!result) {
    console.log('hahahappp', result);
    return null;
  }

  return {
    rows: result.rows,
    command: result.command,
    rowCount: result.rowCount,
    oid: result.oid,
    fields: result.fields,
  };
}

export async function pagedQueryEvent(
  sqlQuery: string,
  values: Array<QueryInput> = [],
  { offset = 0, limit = 10 } = {}
): Promise<QueryResult<Event> | null> {
  const sqlLimit = values.length + 1;
  const sqlOffset = values.length + 2;
  const q = `${sqlQuery} LIMIT $${sqlLimit} OFFSET $${sqlOffset}`;

  const limitAsNumber = toPositiveNumberOrDefault(limit, 10);
  const offsetAsNumber = toPositiveNumberOrDefault(offset, 0);

  const combinedValues = values.concat([limitAsNumber, offsetAsNumber]);

  const result = await query(q, combinedValues);
  // console.log("hahaha", result.rows)
  if (!result) {
    console.log('hahahappp', result);
    return null;
  }

  return {
    rows: result.rows,
    command: result.command,
    rowCount: result.rowCount,
    oid: result.oid,
    fields: result.fields,
  };
}

export async function end() {
  await pool.end();
}

export async function getEventBySlug(slug: string) {
  const q = 'SELECT * FROM events WHERE slug = $1';

  const result = await query(q, [slug]);

  if (result && result.rowCount === 1) {
    return result.rows[0];
  }

  return false;
}

export async function deleteEventBySlug(slug: string): Promise<boolean> {
  console.log('slug', slug);
  const result = await query('DELETE FROM events WHERE slug = $1', [slug]);
  console.log('result 2', result);

  if (!result) {
    return false;
  }

  return result.rowCount === 1;
}

export async function conditionalUpdate(
  table: 'events',
  id: number,
  fields: Array<string | null>,
  values: Array<string | number | null>
) {
  const filteredFields = fields.filter((i) => typeof i === 'string');
  const filteredValues = values.filter(
    (i): i is string | number => typeof i === 'string' || typeof i === 'number'
  );

  if (filteredFields.length === 0) {
    return false;
  }

  if (filteredFields.length !== filteredValues.length) {
    throw new Error('fields and values must be of equal length');
  }

  // id is field = 1
  const updates = filteredFields.map((field, i) => `${field} = $${i + 2}`);

  const q = `
    UPDATE ${table}
      SET ${updates.join(', ')}
    WHERE
      id = $1
    RETURNING *
    `;

  const queryValues: Array<string | number> = (
    [id] as Array<string | number>
  ).concat(filteredValues);
  const result = await query(q, queryValues);

  return result;
}

export async function findEventById(
  id: number
) {
  const q = 'SELECT * FROM events WHERE id = $1';

  const result = await query(q, [id]);

  if (result && result.rowCount === 1) {
    return result.rows[0];
  }
  return false;
}
