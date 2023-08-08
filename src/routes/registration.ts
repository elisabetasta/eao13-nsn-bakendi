import { Request, Response } from 'express';
import { QueryResult } from 'pg';
import { QueryTypes, pagedQuery, query } from '../lib/db.js';
import { Registration } from '../types';
import { findBySlug } from './event.js';
import { findById, isAdmin } from './user.js';

export function regMapper(input: unknown | null): Registration | null {
  const potentialRegistration = input as Partial<Registration | null>;

  if (
    !potentialRegistration ||
    !potentialRegistration.id ||
    !potentialRegistration.eventid ||
    !potentialRegistration.userid ||
    !potentialRegistration.created
  ) {
    return null;
  }

  const registration: Registration = {
    id: potentialRegistration.id,
    eventid: potentialRegistration.eventid,
    userid: potentialRegistration.userid,
    created: potentialRegistration.created
  }

  return registration;
}

export function mapOfRegToReg(input: QueryResult<QueryTypes> | null): Array<Registration> {
  if (!input) return []
  const mappedReg = input?.rows.map(regMapper);
  return mappedReg.filter((i): i is Registration => Boolean(i));
}

export async function listReg(req: Request, res: Response) {
  const offset = 0;
  const limit = 10;

  const eventResult = await pagedQuery(`SELECT * FROM registrations ORDER BY id ASC`, [], { offset, limit });

  const events = mapOfRegToReg(eventResult);

  if (!events) {
    return res.status(500).json({ error: 'unable to list registrations' });
  }

  return res.json(events);
}

export async function registerUserMiddleware(req: Request, res: Response) {
  const { user } = req;
  const { slug } = req.params;
  console.log(user);

  const findUser = await findById(Number(user));
  const findEvent = await findBySlug(slug)

  if (!findUser) {
    return res.status(404).json({ error: 'User not found' })
  }

  if (!findEvent) {
    return res.status(404).json({ error: 'Event not found' })
  }

  const registrationAttempt = await registerUser(findUser.id, findEvent.id);


  if (!registrationAttempt) {
    return res.status(409).json({ error: 'user is already registered' });
  }
  res.sendStatus(201)
}

// export async function registerUserToEvent()
// athuga hvort er skráð inn
// ef skráður inn þá sækja ID á þeim user
// svo tengja userid við eventid og þannig er user skráður á event
//* Middleware
export async function registerUser(userid: number, eventid: number) {
  if (!userid || !eventid) {
    return null;
  }
  // skrá notanda á viðburð
  // athuga hvort user er með token
  // ef ekki þá redirect-a á login
  const q = `
    INSERT INTO registrations
      (userid, eventid)
    VALUES
      ($1, $2)
    RETURNING
      id, eventid, userId;
  `;
  const values = [userid, eventid];
  const result = await query(q, values);

  if (result && result.rowCount === 1) {
    return result.rows[0];
  }

  return null;
}

export async function listRegistrations(req: Request, res: Response) {
  // const offset = 0;
  // const limit = 10;

  const { slug } = req.params;


  const event = await findBySlug(slug);


  const registerResult = await query(`SELECT *
      FROM registrations WHERE eventId = $1 ORDER BY id ASC`, [event.id]
  );


  const users = mapOfRegToReg(registerResult);

  if (!users) {
    return res.status(500).json({ error: 'unable to list registrations' });
  }


  return res.json(users);
}


export async function getRegister(req: Request, res: Response) {
  const { id } = req.params
  const { slug } = req.params

  const event = await findBySlug(slug);
  const eventid = event.id;

  const registration = await findByRegisterUserId(Number(id), eventid);

  if (!registration) {
    return res.status(404).json({ error: 'Registration not found' });
  }


  return res.status(202).json(registration);
}

export async function deleteRegister(req: Request, res: Response) {
  const { id } = req.params;
  const { user } = req;
  const { slug } = req.params

  const admin = Number(id) === user;
  const isadmin = await isAdmin(Number(user));
  const eitherAdmin = admin || isadmin;

  if (!eitherAdmin) {
    return res.status(404).json({ error: 'Unable to delete registrations, only admins' });
  }

  const event = await findBySlug(slug);
  const eventid = event.id;

  const registration = await findByRegisterUserId(Number(id), eventid);

  if (!registration) {
    return res.status(404).json({ error: 'Registration not found' });
  }

  const result = await query('DELETE FROM registrations WHERE userid = $1 AND eventid = $2', [registration.userid, registration.eventid]);

  if (!result) {
    return res.status(500).json({ error: 'Villa í query' });
  }
  return res.status(204).json({ error: '' });


}

export async function findByRegisterId(id: number) {
  const q = 'SELECT * FROM registrations WHERE id = $1';

  const result = await query(q, [id]);

  if (result && result.rowCount === 1) {
    return result.rows[0];
  }

  console.error('unable to find user by id', id);

  return null;
}

export async function findByRegisterUserId(id: number, eventId: number) {
  const q = 'SELECT * FROM registrations WHERE userid = $1 and eventid = $2';

  const result = await query(q, [id, eventId]);

  if (result && result.rowCount === 1) {
    return result.rows[0];
  }

  console.error('unable to find user by id', id, ' in event with id ', eventId);

  return null;
}
