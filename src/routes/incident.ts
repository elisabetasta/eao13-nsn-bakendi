import dotenv from 'dotenv';
import { NextFunction, Request, Response } from 'express';
import { QueryResult } from 'pg';
import {
  conditionalUpdate,
  deleteIncidentBySlug,
  getIncidentById,
  getIncidentBySlug,
  pagedQueryIncident,
  query
} from '../lib/db.js';
import { slugify } from '../lib/slugify.js';
import { Incident } from '../types.js';
import { isAdmin } from './user.js';

dotenv.config();

export function incidentMapper(input: unknown | null): Incident | null {
  const potentialIncident = input as Partial<Incident | null>;

  if (
    !potentialIncident ||
    !potentialIncident.id ||
    !potentialIncident.title ||
    !potentialIncident.slug || // Is this meant to be here?
    !potentialIncident.description ||
    !potentialIncident.feedback_id ||
    !potentialIncident.child_id ||
    !potentialIncident.user_id ||
    !potentialIncident.created ||
    !potentialIncident.updated
  ) {
    return null;
  }

  const incident: Incident = {
    id: potentialIncident.id,
    title: potentialIncident.title,
    slug: potentialIncident.slug,
    description: potentialIncident.description,
    feedback_id: potentialIncident.feedback_id,
    child_id: potentialIncident.child_id,
    user_id: potentialIncident.user_id,
    created: potentialIncident.created,
    updated: potentialIncident.updated
  };

  return incident;
}

export function mapOfIncidentsToIncidents(
  input: QueryResult<Incident> | null
): Array<Incident> {
  if (!input) {
    return [];
  }
  const mappedIncidents = input?.rows.map(incidentMapper);
  return mappedIncidents.filter((i): i is Incident => Boolean(i));
}

export async function listIncidents(req: Request, res: Response) {
  const offset = 0;
  const limit = 10;

  const incidentResult = await pagedQueryIncident(
    `SELECT * FROM incident ORDER BY id ASC`,
    [],
    { offset, limit }
  );

  const incidents = mapOfIncidentsToIncidents(incidentResult);

  if (!incidents) {
    return res.status(500).json({ error: 'unable to list incidents' });
  }

  return res.json(incidents);
}

export async function registerIncident(req: Request, res: Response) {
  const { title, description, feedback_id, child_id, user_id } = req.body;
  // console.log("parameters for POST: ", title, " ", description)

  // leyfa almennan user
  // sækja id
  // skrá id á user_id á atvikinu
  // const { user } = req;
  // console.log("User í registerIncident: ", user)

  const result = await createIncident(title, description, Number(feedback_id), Number(child_id), Number(user_id));
  if (result === null) {
    return res
      .status(500)
      .json({ error: 'unable to create incident, only admins' });
  }
  return res.status(201).json(result);
}

export async function createIncident(
  title: string,
  description: string,
  feedback_id: number,
  child_id: number,
  user_id: number
) {
  const q = `
  INSERT INTO
    incident (title, slug, description, feedback_id, child_id, user_id)
  VALUES
    ($1, $2, $3, $4, $5, $6)
  RETURNING *
  `;

  const values = [title, slugify(title), description, feedback_id, child_id, user_id];
  // if ((await isAdmin(user_id)) === false) {
  //   console.log('I am not an admin ;D');
  //   console.warn('Only admin users can create incidents');
  //   return null;
  // }

  const result = await query(q, values);
  if (result) {
    return result.rows[0];
  }

  console.warn('Unable to create incident');
  return false;
}

export async function findByIncidentSlug(slug: string) {
  const q = 'SELECT * FROM incident WHERE slug = $1';

  const result = await query(q, [slug]);

  if (result && result.rowCount === 1) {
    return result.rows[0];
  }

  return false;
}

export async function getIncidentSlug(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { slug } = req.params;

  const incident = await getIncidentBySlug(slug);

  if (!incident) {
    return next();
  }

  return res.json(incident);
}

export async function getIncidentId(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { id } = req.params;

  const incident = await getIncidentById(id);

  if (!incident) {
    console.error("Incident not found for id: ", id);
    return next();
  }

  return res.json(incident);
}

export async function deleteIncident(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { slug } = req.params;
  const { user } = req;

  if (!(await isAdmin(Number(user)))) {
    return res
      .status(500)
      .json({ error: 'unable to delete incident, only admins' });
  }

  const incident = await getIncidentBySlug(slug);

  if (!incident) {
    return next();
  }

  const result = await deleteIncidentBySlug(slug);
  console.log('result', result);

  if (!result) {
    return next(new Error('Unable to delete incident'));
  }

  return res.status(204).json({});
}

export async function updateIncidentHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { slug } = req.params;
  const incident = await getIncidentBySlug(slug);
  const { user } = req;

  if (!(await isAdmin(Number(user)))) {
    return res
      .status(500)
      .json({ error: 'Unable to update incident, only admins' });
  }

  if (!incident) {
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
    'incident',
    incident.id,
    fields,
    values
  );

  if (!updated) {
    return next(new Error('Unable to update incident'));
  }

  const updatedIncident = incidentMapper(updated.rows[0]);
  return res.json(updatedIncident);
}

export async function getIncidentIdBySlug(slug: string) {
  const incident = await getIncidentBySlug(slug);

  if (!incident) {
    return null;
  }

  return incident.id;
}
