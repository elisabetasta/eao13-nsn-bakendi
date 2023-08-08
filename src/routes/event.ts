import dotenv from 'dotenv';
import { NextFunction, Request, Response } from 'express';
import { QueryResult } from 'pg';
import {
  QueryTypes,
  conditionalUpdate,
  deleteEventBySlug,
  getEventBySlug,
  pagedQueryEvent,
  query
} from '../lib/db.js';
import { slugify } from '../lib/slugify.js';
import { Event } from '../types.js';
import { isAdmin } from './user.js';

dotenv.config();

export function eventMapper(input: unknown | null): Event | null {
  const potentialEvent = input as Partial<Event | null>;

  if (
    !potentialEvent ||
    !potentialEvent.id ||
    !potentialEvent.title ||
    !potentialEvent.slug || // á þetta að vera með hér?
    !potentialEvent.description ||
    !potentialEvent.creatorid ||
    !potentialEvent.created
  ) {
    return null;
  }

  const event: Event = {
    id: potentialEvent.id,
    title: potentialEvent.title,
    slug: potentialEvent.slug,
    description: potentialEvent.description,
    creatorid: potentialEvent.creatorid,
    created: potentialEvent.created,
  };

  return event;
}

// ætti þetta heldur að heita "mapOfEventToEvents"?
// eða "mapOfEventsToEvent"?
export function mapOfEventsToEvents(
  input: QueryResult<QueryTypes> | null
): Array<Event> {
  if (!input) {
    return [];
  }
  const mappedEvent = input?.rows.map(eventMapper);
  return mappedEvent.filter((i): i is Event => Boolean(i));
}

export async function listEvents(req: Request, res: Response) {
  const offset = 0;
  const limit = 10;

  const eventResult = await pagedQueryEvent(
    `SELECT * FROM events ORDER BY id ASC`,
    [],
    { offset, limit }
  );

  const events = mapOfEventsToEvents(eventResult);

  if (!events) {
    return res.status(500).json({ error: 'unable to list events' });
  }

  return res.json(events);
}

export async function registerEvent(req: Request, res: Response) {
  const { title, description } = req.body; // hvenig og hvar sækjum við creatorid? sem sagt hvernig sækjum við innskráðan notanda?

  const { user } = req;

  //const userid = user.rows;
  const result = await createEvent(title, description, Number(user));
  if (result === null) {
    return res
      .status(500)
      .json({ error: 'unable to create event, only admins' });
  }
  return res.status(201).json(result);
}

export async function createEvent(
  title: string,
  description: string,
  creatorid: number
) {
  const q = `
  INSERT INTO
    events (title, slug, description, creatorId)
  VALUES
    ($1, $2, $3, $4)
  RETURNING *
  `;

  const values = [title, slugify(title), description, creatorid]; // þurfum að sækja hver er innskráður notandi
  if ((await isAdmin(creatorid)) === false) {
    console.log('Ég er ekki admin ;D');
    console.warn('only admin users can create events');
    return null;
  }

  const result = await query(q, values);
  if (result) {
    return result.rows[0];
  }

  console.warn('unable to create event');
  return false;
}

export async function findBySlug(slug: string) {
  const q = 'SELECT * FROM events WHERE slug = $1';

  const result = await query(q, [slug]);

  if (result && result.rowCount === 1) {
    return result.rows[0];
  }

  return false;
}

export async function getEvent(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { slug } = req.params;

  const event = await getEventBySlug(slug);

  if (!event) {
    return next();
  }

  return res.json(event);
}

export async function deleteEvent(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { slug } = req.params;
  const { user } = req;

  if (!(await isAdmin(Number(user)))) {
    return res
      .status(500)
      .json({ error: 'unable to delete event, only admins' });
  }

  const department = await getEventBySlug(slug);

  if (!department) {
    return next();
  }

  const result = await deleteEventBySlug(slug);
  console.log('result', result);

  if (!result) {
    return next(new Error('unable to delete event'));
  }

  return res.status(204).json({});
}

export async function updateEventHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { slug } = req.params;
  const department = await getEventBySlug(slug);
  const { user } = req;

  if (!(await isAdmin(Number(user)))) {
    return res
      .status(500)
      .json({ error: 'unable to update event, only admins' });
  }

  if (!department) {
    return next();
  }

  const { title, description } = req.body;

  const fields = [
    typeof title === 'string' && title ? 'title' : null,
    typeof title === 'string' && title ? 'slug' : null,
    typeof description === 'string' && description ? 'description' : null,
  ];

  const values = [
    typeof title === 'string' && title ? title : null,
    typeof title === 'string' && title ? slugify(title).toLowerCase() : null,
    typeof description === 'string' && description ? description : null,
  ];

  const updated = await conditionalUpdate(
    'events',
    department.id,
    fields,
    values
  );

  if (!updated) {
    return next(new Error('unable to update event'));
  }

  const updatedDepartment = eventMapper(updated.rows[0]);
  return res.json(updatedDepartment);
}

export async function getEventIdBySlug(slug: string) {
  const event = await getEventBySlug(slug);

  if (!event) {
    return null;
  }

  return event.id;
}
