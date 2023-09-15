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

const jwtSecret = process.env.JWT_SECRET as string;

export function userMapper(input: unknown | null): User | null {
  const potentialUser = input as Partial<User | null>;

  console.log("Potential user:", potentialUser);

  if (
    potentialUser?.id === undefined ||
    potentialUser?.name === undefined ||
    potentialUser?.username === undefined ||
    potentialUser?.password === undefined ||
    potentialUser?.admin === undefined ||
    potentialUser?.user_type_id === undefined ||
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
    user_type_id: potentialUser.user_type_id,
    created: potentialUser.created,
  };

  return user;
}

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

export async function listUsers(req: Request, res: Response) {
  try {
    console.log("Entering listUsers in user.ts");

    const usersResult = await query(`SELECT * FROM "user"`);

    const users = mapOfUsersToUsers(usersResult);

    return res.json(users);
  } catch (error) {
    console.error("Error listing users:", error);
    return res.status(500).json({ error: 'Unable to list users' });
  }
}

export async function registerUser(req: Request, res: Response) {
  console.log(`jwtSecret: ${jwtSecret}`);

  const { name, username, password = '', admin = false, user_type_id } = req.body;

  console.log("reqqq", req.body);

  const result = await createUser(name, username, password, admin, user_type_id);

  if (!result) {
    return res.status(500).json({ error: 'unable to create user' });
  }

  delete result.password;

  // const token = jwt.sign({ userId: user.id, admin: user.admin }, secret, { expiresIn: '1h' });

  const payload = { id: result.id };
  const token = jwt.sign(payload, jwtSecret, tokenOptions);
  return res.json({
    result,
    token,
    expiresIn: tokenOptions.expiresIn,
  });
}

export async function createUser(name: string, username: string, password: string, admin: boolean, user_type_id: number) {
  const saltedPassword = await bcrypt.genSalt(SALT_ROUNDS);
  const hashedPassword = await bcrypt.hash(password, saltedPassword);

  const q = `
    INSERT INTO
      "user" (name, username, password, admin, user_type_id)
    VALUES
      ($1, $2, $3, $4, $5)
    RETURNING *`;

  const values = [xss(name), xss(username), hashedPassword, admin, user_type_id];

  const result = await query(q, values);

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


// export async function loginRoute(req: Request, res: Response) {
//   const { username, password = '' } = req.body;
//   const user = await findByUsername(username);

//   if (!user) {
//     return res.status(401).json({ error: 'Invalid user/password' });
//   }

//   const passwordIsCorrect = await comparePasswords(password, user.password);

//   if (passwordIsCorrect) {
//     const payload = { id: user.id };
//     const token = jwt.sign(payload, jwtOptions.secretOrKey, tokenOptions);
//     console.log("user ", user.name, " has been logged in and this is the user object: ", user);

//     delete user.password;

//     return res.json({
//       user,
//       token,
//       expiresIn: tokenOptions.expiresIn,
//     });

//   }

//   return res.status(401).json({ error: 'Invalid user/password' });
// }

// export async function currentUserRoute(req: Request, res: Response) {
//   // console.log("in currentUserRoute");
//   // const authHeader = req.headers["authorization"];

//   // if (!authHeader) {
//   //   return res.status(401).json({ error: 'Authorization header missing' });
//   // }

//   // const token = authHeader.split(' ')[1];

//   // if (!token) {
//   //   return res.status(401).json({ error: 'Token not provided' });
//   // }

//   // jwt.verify(token, jwtSecret, async (err, user) => {
//   //   if (err) {
//   //     return res.status(403).json({ error: 'Token is not valid' });
//   //   }

//   //   const userId = (user as User).id; // Type assertion

//   //   const userById = await findById(userId);

//   //   if (!userById) {
//   //     return res.status(404).json({ error: 'User not found' });
//   //   }

//   //   delete userById.password;

//   //   return res.json(userById);
//   // });
//   const { id } = req.user as User;

//   if (!id) {
//     return res.status(400).json({ error: 'User id is missing' })
//   }

//   const user = await findById(id);

//   if (!user) {
//     return res.status(404).json({ error: 'User not found' });
//   }

//   delete user.password;

//   return res.json(user);
// }

export async function returnUser(req: Request, res: Response) {
  const { user } = req;
  const { id } = req.params;

  const userById = await findById(Number(user));

  if (!userById) {
    return res.status(404).json({ error: 'User not loggin' });
  }

  if (!await isAdmin(userById.id)) {
    return res.status(500).json({ error: 'unable to get user, only admins' });
  }

  const findUser = await findById(Number(id));
  if (!findUser) {
    return res.status(404).json({ error: 'User not found' });
  }

  delete findUser.password;

  return res.status(201).json(findUser);
}

export async function logoutRoute(req: Request, res: Response) {
  console.log("er í logoutRoute");
  const authHeader = req.headers["authorization"];

  console.log("auth header er: ", authHeader);

  if (authHeader) {
    console.log("inni í authHeader if");
    jwt.sign(authHeader, "", { expiresIn: 1 }, (logout, err) => {
      if (logout) {
        console.log("inni í logout if");
        res.send({ msg: 'You have been logged out' });
      } else {
        console.log("inni í logout else");
        res.send({ error: err });
      }
    });
  } else {
    console.log("inni í authHeader else");
    res.status(400).json({ error: 'Authorization header is missing' });
  }
}

export async function findByUsername(username: string) {
  const q = 'SELECT * FROM "user" WHERE username = $1';

  const result = await query(q, [username]);

  if (result && result.rowCount === 1) {
    return result.rows[0];
  }

  return false;
}

export async function findById(id: number) {
  console.log("Er í findById í user.ts");
  const q = 'SELECT * FROM "user" WHERE id = $1';

  const result = await query(q, [id]);

  if (result && result.rowCount === 1) {
    return result.rows[0];
  }

  console.error('unable to find user by id', id);

  return null;
}

export async function isAdmin(userid: number) {
  console.log(userid);
  const q = `SELECT admin FROM "user" where id = $1`;
  const result = await query(q, [userid]);
  console.log('result', result);
  console.log(result?.rows[0].admin);
  if (result?.rows[0].admin === true) {
    return true;
  }
  else if (result?.rows[0].admin === false) return false;
}

export async function getUserTypeReference(req: Request, res: Response) {
  const q = 'SELECT * FROM UserTypeReference';

  try {
    const result = await query(q, []);

    if (result) {
      const userTypeReferences = result.rows;
      return res.status(200).json(userTypeReferences);
    } else {
      return res.status(500).json({ error: 'Internal server error' });
    }
  } catch (error) {
    console.error('Error fetching user type references:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function postUserTypeReference(req: Request, res: Response) {
  console.log("er í postusertypereference");
  const { type_name } = req.body;
  const { user } = req;

  if (!(await isAdmin(Number(user)))) {
    return res.status(500).json({ error: 'Unable to create user type, only admins' });
  }

  const q = 'INSERT INTO UserTypeReference (type_name) VALUES ($1) RETURNING *';

  try {
    const result = await query(q, [type_name]);

    if (result) {
      const userTypeReferences = result.rows;
      return res.status(200).json(userTypeReferences);
    } else {
      return res.status(500).json({ error: 'Internal server error' });
    }
  } catch (error) {
    console.error('Error inserting user type reference:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function findByTypeName(type_name: string) {
  const q = 'SELECT * FROM usertypereference WHERE type_name = $1';

  const result = await query(q, [type_name]);

  if (result && result.rowCount === 1) {
    return result.rows[0];
  }

  return false;
}

export default {
  userMapper,
  mapOfUsersToUsers,
  listUsers,
  registerUser,
  createUser,
  comparePasswords,
  loginRoute,
  // currentUserRoute,
  returnUser,
  logoutRoute,
  findByUsername,
  findById,
  isAdmin,
  getUserTypeReference,
  postUserTypeReference,
  findByTypeName,
};
