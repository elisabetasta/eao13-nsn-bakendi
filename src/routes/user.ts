import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { Request, Response } from 'express';
import jwt from "jsonwebtoken";
import { QueryResult } from "pg";
import xss from 'xss';
import { query } from '../lib/db.js';
import { jwtOptions, tokenOptions } from '../lib/passport.js';
import { User } from '../types.js';

const SALT_ROUNDS = 12;


dotenv.config();


// export type User = {
//   id: number,
//   name: string,
//   username: string,
//   password: string,
//   admin: boolean | undefined
// }

/**
 * Skoðar hvort hægt sé að búa til user útfrá inputi
 * @param input Inniheldur upplýsingum um mögulean user
 * @returns Skilar null ef ekki er hægt að búa til user, en ef
 * hægt er að búa til, skilar hann user
 */
export function userMapper(input: unknown | null): User | null {
  const potentialUser = input as Partial<User | null>;

  console.log("Potential user:", potentialUser);

  if (
    potentialUser?.id === undefined ||
    potentialUser?.name === undefined ||
    potentialUser?.username === undefined ||
    potentialUser?.password === undefined ||
    potentialUser?.admin === undefined ||
    potentialUser?.type === undefined ||
    potentialUser?.created === undefined
  ) {
    console.log("User mapping failed due to missing properties:", potentialUser);
    return null;
  }

  const user: User = {
    id: potentialUser.id,
    name: potentialUser.name,
    username: potentialUser.username,
    password: potentialUser.password,
    admin: potentialUser.admin,
    type: potentialUser.type,
    created: potentialUser.created,
  };

  return user;
}



/**
 * Mappar í gegnum mögulegu nýju user-a sem verið er að ná í
 * @param input QueryResult með mögulegum User-um
 * @returns Skilar tómufylki eða fylki sem inniheldur User.
 */
export function mapOfUsersToUsers(input: QueryResult<User> | null): Array<User> {
  if (!input) {
    return [];
  }

  const mappedUsers = input.rows.map((row) => {
    console.log("Mapping user row:", row);
    const mappedUser = userMapper(row);
    console.log("Mapped user:", mappedUser);
    return mappedUser;
  });

  const filteredUsers = mappedUsers.filter((user): user is User => Boolean(user));

  console.log("Filtered users:", filteredUsers);

  return filteredUsers;
}


// GET: '/user'

/**
 * Finnur alla User sem til eru og skilar lista með þeim
 * @param req Request
 * @param res Response
 * @returns Skilar lista af User-um inni á ákveðnu bili, sem passa innan page-ing
 */
export async function listUsers(req: Request, res: Response) {
  try {
    console.log("Entering listUsers in user.ts");

    const usersResult = await query(`SELECT * FROM "user"`);

    console.log("Users result:", usersResult);

    const users = mapOfUsersToUsers(usersResult);

    console.log("Mapped users:", users);

    return res.json(users);
  } catch (error) {
    console.error("Error listing users:", error);
    return res.status(500).json({ error: 'Unable to list users' });
  }
}



// POST: '/users/register'

/**
 * Tekur inn upplsýingar sem Request inniheldur og býr til user ef hægt,
 * sendir villumeldingu ef villa kemur annars upplýsingum um notnada
 * @param req Request
 * @param res Response
 * @returns Skilar nýjum User
 */
export async function registerRoute(req: Request, res: Response) {
  const { name, username, password = '', admin = false } = req.body;

  const result = await createUser(name, username, password, admin);

  if (!result) {
    return res.status(500).json({ error: 'unable to create user' });
  }

  delete result.password;

  const payload = { id: result.id };
  const token = jwt.sign(payload, jwtOptions.secretOrKey, tokenOptions);
  return res.json({
    result,
    token,
    expiresIn: tokenOptions.expiresIn,
  });

}

// !!!!! ATH hér þarf að gera salt og hash í pw
/**
 * Býr til nýja User
 * @param name nafn notanda
 * @param username notendanafn notanda
 * @param password lykilorð notanda
 * @param admin hvort hann sé admin eða ekki
 * @returns Skilar nýjum notanda ef hægt var að búa til
 */
export async function createUser(name: string, username: string, password: string, admin: boolean) {
  const saltedPassword = await bcrypt.genSalt(SALT_ROUNDS)
  // console.log(saltedPassword)
  const hashedPassword = await bcrypt.hash(password, saltedPassword);

  const q = `
      INSERT INTO
        users (name, username, password, admin)
      VALUES
        ($1, $2, $3, $4)
      RETURNING *`;

  const values = [xss(name), xss(username), hashedPassword, admin];
  // console.log("values eru: ", values)
  const result = await query(q, values);
  console.log("Result í user.ts: ", result)
  if (result) {
    return result.rows[0];
  }

  console.warn('unable to create user');

  return false;
}

export async function comparePasswords(password: string, hash: string) {
  const result = await bcrypt.compare(password, hash);

  return result;
}


// POST: '/users/login'

/**
 * Logar einstakling inn, skoðar hvort notandi sé til
 * ef ekki sendir villumeldingu, en notandi er til skilar hann
 * notenda upplýsingum um einstakling
 * @param req Request
 * @param res Response
 * @returns Skilar notanda ef einstaklingur er til, annars villumeldingu
 */
export async function loginRoute(req: Request, res: Response) {
  const { username, password = '' } = req.body;
  const user = await findByUsername(username);

  if (!user) {
    return res.status(401).json({ error: 'Invalid user/password' });
  }


  const passwordIsCorrect = await comparePasswords(password, user.password);

  if (passwordIsCorrect) {
    const payload = { id: user.id };
    const token = jwt.sign(payload, jwtOptions.secretOrKey, tokenOptions);
    return res.json({
      user,
      token,
      expiresIn: tokenOptions.expiresIn,
    });
  }

  return res.status(401).json({ error: 'Invalid user/password' });
}


// GET: '/users/me'

/**
 * Finnur hvaða notandi er skráður inn
 * @param req  Request
 * @param res Response
 * @returns Skilar þeim notanda sem er logaður inn
 */
export async function currentUserRoute(req: Request, res: Response) {
  const { user } = req;

  const userById = await findById(Number(user))

  if (!userById) {
    return res.status(404).json({ error: 'User not found' });
  }

  delete userById.password;

  return res.json(userById);
}

// GET: '/users/:id'

/**
 * FInnur þann notanda sem hefur þetta id og skilar honum ef hann er til,
 * annars 404 villumeldingu um að hann sé Not Found
 * @param req Request
 * @param res Response
 * @returns Skilar notandanum ef til annars villumeldingu
 */
export async function returnUser(req: Request, res: Response) {
  const { user } = req;
  const { id } = req.params;

  const userById = await findById(Number(user))

  if (!userById) {
    return res.status(404).json({ error: 'User not loggin' });
  }

  if (!await isAdmin(userById.id)) {
    return res.status(500).json({ error: 'unable to get user, only admins' });
  }


  const findUser = await findById(Number(id))
  if (!findUser) {
    return res.status(404).json({ error: 'User not found' });
  }


  delete findUser.password;

  return res.status(201).json(findUser);
}


// Query leitar föll

/**
 * Leitar af User sem hefur notendanafnið
 * @param username notendanafn notanda
 * @returns Skilar notanda ef notandi er til annars false
 */
export async function findByUsername(username: string) {
  const q = 'SELECT * FROM users WHERE username = $1';

  const result = await query(q, [username]);

  if (result && result.rowCount === 1) {
    return result.rows[0];
  }

  return false;
}

/**
 * Leitar af User með þetta id
 * @param id auðkennisnúmer notanda
 * @returns Skilar notanda ef notandi hefur þetta id, annars null
 */
export async function findById(id: number) {
  const q = 'SELECT * FROM users WHERE id = $1';

  const result = await query(q, [id]);

  if (result && result.rowCount === 1) {
    return result.rows[0];
  }

  console.error('unable to find user by id', id);

  return null;
}

/**
 * Athugar ef user með id userid er admin
 * @param userid id þess notanda sem verið er að athuga
 * @returns true ef notandi er admin, annars false
 */
export async function isAdmin(userid: number) {
  console.log(userid);
  const q = `SELECT admin FROM users where id = $1`;
  const result = await query(q, [userid]);
  console.log('result', result);
  console.log(result?.rows[0].admin);
  if (result?.rows[0].admin === true) {
    return true;
  }
  else if (result?.rows[0].admin === false) return false;
}
