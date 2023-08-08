import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import { NextFunction, Request, Response } from 'express';
import { QueryResult } from 'pg';
import { QueryTypes, query } from '../lib/db.js';
import { findBySlug } from './event.js';
import { isAdmin } from './user.js';
// Cloudinary config
cloudinary.config({
  cloud_name: 'dyuygwggo',
  api_key: '335864646356278',
  api_secret: 'HN_XVhUYxyLucnP37wen8lZCCR4',
});

dotenv.config();

export type Speaker = {
  id: number;
  firstname: string;
  middlename?: string;
  lastname: string;
  imageurl?: string; // er rétt að hafa þetta svona?
  eventid: number;
};

export function spakerMapper(input: unknown | null): Speaker | null {
  const potentialSpeaker = input as Partial<Speaker | null>;

  if (
    !potentialSpeaker ||
    !potentialSpeaker.id ||
    !potentialSpeaker.firstname ||
    !potentialSpeaker.lastname ||
    !potentialSpeaker.eventid
  ) {
    return null;
  }

  const speaker: Speaker = {
    id: potentialSpeaker.id,
    firstname: potentialSpeaker.firstname,
    middlename: potentialSpeaker.middlename,
    lastname: potentialSpeaker.lastname,
    imageurl: potentialSpeaker.imageurl,
    eventid: potentialSpeaker.eventid,
  };

  return speaker;
}

function mapSpeakerOfSpeaker(
  input: QueryResult<QueryTypes> | null
): Speaker | null {
  if (!input) {
    return null;
  }
  return spakerMapper(input.rows[0]);
}

export function mapSpeakersOfSpeakers(
  input: QueryResult<QueryTypes> | null
): Array<Speaker> {
  if (!input) {
    return [];
  }

  const mappedUser = input?.rows.map(spakerMapper);
  return mappedUser.filter((i): i is Speaker => Boolean(i));
}

export async function getSpeaker(req: Request, res: Response) {
  const { id } = req.params;
  const { user } = req;

  if (!(await isAdmin(Number(user)))) {
    return res
      .status(500)
      .json({ error: 'unable to get speaker, only admins' });
  }

  const speaker = await getSpeakerById(Number(id));

  if (!speaker) {
    return res.status(500).json({ error: 'unable to list users' });
  }

  return res.json(speaker);
}

export async function listSpeakers(req: Request, res: Response) {
  // const offset = 0;
  // const limit = 10;
  const { slug } = req.params;

  const event = await findBySlug(slug);

  const usersResult = await query(
    `SELECT *
        FROM speaker WHERE eventId = $1 ORDER BY id ASC`,
    [event.id]
  );

  const users = mapSpeakersOfSpeakers(usersResult);

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

export async function createSpeaker(req: Request, res: Response) {
  const { slug } = req.params;

  const { firstname, middlename = '', lastname } = req.body;
  const { user } = req;


  if (!(await isAdmin(Number(user)))) {
    return res
      .status(500)
      .json({ error: 'unable to create speaker, only admins' });
  }

  // Fæll sem fæst úr http requesti
  const file: any = req.file;
  console.log(file);

  // TODO: Finna út hvernig á að henda þessum file inn á cloudinary

  let imageUrl = null;
  if (file) {
    console.log('FILE EXISTS');
    try {
      // Virkar að uploada eftir url
      const url1 = './src/test/testimg.png';
      console.log('file', file);

      // Mynd á að koma inn í staðinn fyrir url
      // Hvað á að fara hingað inn
      const imageResponse = await cloudinary.uploader.upload(file.path, {
        public_id: `${Date.now()}`,
        resource_type: 'auto',
        folder: 'image',
      });
      // TODO
      // console.log(imageResponse);
      // Setja imageResponse.url í gagnagrunn
      imageUrl = imageResponse.url;
    } catch (err) {
      // Engin mynd
      console.error(err);
      return res.json(err);
    }
  }
  const event = await findBySlug(slug);

  const q = `
      INSERT INTO
        speaker (firstname, middlename, lastname, imageUrl, eventid)
      VALUES
        ($1, $2, $3, $4, $5)
      RETURNING *`;
  const values = [firstname, middlename, lastname, imageUrl, event.id];
  const result = await query(q, values);
  console.log(result);

  if (!result) {
    return res.status(500).json({ error: 'unable to create speaker' });
  }

  return res.status(201).json(result.rows[0]);
}

export async function deleteSpeaker(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { id } = req.params;
  const { user } = req;

  if (!(await isAdmin(Number(user)))) {
    return res
      .status(500)
      .json({ error: 'unable to delete speaker, only admins' });
  }

  const speaker = await getSpeakerById(Number(id));

  if (!speaker) {
    return next();
  }

  const result = await query('DELETE FROM speaker WHERE id = $1', [speaker.id]);

  if (!result) {
    return res.status(500).json({ error: 'Villa í query' });
  }
  return res.status(204).json({ error: '' });
}

export async function getSpeakerById(id: number) {
  const speakerResult = await query('SELECT * FROM speaker WHERE id = $1', [
    id,
  ]);
  const speaker = mapSpeakerOfSpeaker(speakerResult);
  return speaker;
}
