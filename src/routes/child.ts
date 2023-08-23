import dotenv from 'dotenv';
import { NextFunction, Request, Response } from 'express';
import { QueryResult } from 'pg';
import { query } from '../lib/db.js';
import { Child } from '../types.js';
import { isAdmin } from './user.js';
// Cloudinary config


dotenv.config();

// export type Child = {
//   id: number;
//   name: string;
//   group_id: number;
// };

export function childMapper(input: unknown | null): Child | null {
  const potentialChild = input as Partial<Child | null>;

  if (
    !potentialChild ||
    !potentialChild.id ||
    !potentialChild.name ||
    !potentialChild?.group_id
  ) {
    return null;
  }

  const child: Child = {
    id: potentialChild.id,
    name: potentialChild.name,
    group_id: potentialChild.group_id,
  };

  return child;
}

function mapChildOfChild(
  input: QueryResult<Child> | null
): Child | null {
  if (!input) {
    return null;
  }
  return childMapper(input.rows[0]);
}

export function mapChildrenOfChildren(
  input: QueryResult<Child> | null
): Array<Child> {
  if (!input) {
    return [];
  }

  const mappedUser = input?.rows.map(childMapper);
  return mappedUser.filter((i): i is Child => Boolean(i));
}

export async function getChild(req: Request, res: Response) {
  const { id } = req.params;
  const { user } = req;

  if (!(await isAdmin(Number(user)))) {
    return res
      .status(500)
      .json({ error: 'unable to get child, only admins' });
  }

  const child = await getChildById(Number(id));

  if (!child) {
    return res.status(500).json({ error: 'unable to list users' });
  }

  return res.json(child);
}

export async function findByChildSlug(slug: string) {
  const q = 'SELECT * FROM child WHERE slug = $1';

  const result = await query(q, [slug]);

  if (result && result.rowCount === 1) {
    return result.rows[0];
  }

  return false;
}

export async function listChildren(req: Request, res: Response) {
  // const offset = 0;
  // const limit = 10;
  const { slug } = req.params;

  const event = await findByChildSlug(slug);

  const usersResult = await query(
    `SELECT *
        FROM child WHERE eventId = $1 ORDER BY id ASC`,
    [event.id]
  );

  const users = mapChildrenOfChildren(usersResult);

  if (!users) {
    return res.status(500).json({ error: 'unable to list users' });
  }

  /*
  const usersWithPage = addPageMetadata(users, req.path, {
    offset,
    limit,
    length: users.length,
  });
  */

  return res.json(users);
}

export async function createChild(req: Request, res: Response) {

  const { name } = req.body;
  const { user } = req;


  if (!(await isAdmin(Number(user)))) {
    return res
      .status(500)
      .json({ error: 'unable to create child, only admins' });
  }

  const q = `
      INSERT INTO
        child (name)
      VALUES
        ($1)
      RETURNING *`;
  const values = [name];
  const result = await query(q, values);
  console.log(result);

  if (!result) {
    return res.status(500).json({ error: 'unable to create child' });
  }

  return res.status(201).json(result.rows[0]);
}

export async function deleteChild(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { id } = req.params;
  const { user } = req;

  if (!(await isAdmin(Number(user)))) {
    return res
      .status(500)
      .json({ error: 'unable to delete child, only admins' });
  }

  const child = await getChildById(Number(id));

  if (!child) {
    return next();
  }

  const result = await query('DELETE FROM child WHERE id = $1', [child.id]);

  if (!result) {
    return res.status(500).json({ error: 'Villa í query' });
  }
  return res.status(204).json({ error: '' });
}

export async function getChildById(id: number) {
  const ChildResult = await query('SELECT * FROM child WHERE id = $1', [
    id,
  ]);
  const child = mapChildOfChild(ChildResult);
  return child;
}
