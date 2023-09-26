import dotenv from 'dotenv';
import { Request, Response } from 'express';
import { QueryResult } from "pg";
import { query } from '../lib/db.js';
import { UserGroup } from '../types.js';

dotenv.config();

export function userGroupMapper(input: unknown | null): UserGroup | null {
  const potentialUserGroup = input as Partial<UserGroup | null>;

  console.log("Potential usergroup:", potentialUserGroup);

  if (
    potentialUserGroup?.id === undefined ||
    potentialUserGroup?.child_id === undefined ||
    potentialUserGroup?.user_id === undefined
  ) {
    console.log("UserGroup mapping failed due to missing properties:", potentialUserGroup);
    return null;
  }

  const usergroup: UserGroup = {
    id: potentialUserGroup.id,
    child_id: potentialUserGroup.child_id,
    user_id: potentialUserGroup.user_id,
  };

  return usergroup;
}

export function mapOfUserGroupsToUserGroups(input: QueryResult<UserGroup> | null): Array<UserGroup> {
  if (!input) {
    return [];
  }

  const mappedUserGroups = input.rows.map((row) => {
    console.log("Mapping usergroup row:", row);
    const mappedUserGroup = userGroupMapper(row);
    console.log("Mapped usergroup:", mappedUserGroup);
    return mappedUserGroup;
  });

  const filteredUserGroups = mappedUserGroups.filter((usergroup): usergroup is UserGroup => Boolean(usergroup));

  console.log("Filtered users:", filteredUserGroups);

  return filteredUserGroups;
}

export async function listUserGroups(req: Request, res: Response) {
  try {
    console.log("Entering listUserGroups in usergroup.ts");

    const usersResult = await query(`SELECT * FROM "usergroup"`);

    const users = mapOfUserGroupsToUserGroups(usersResult);

    return res.json(users);
  } catch (error) {
    console.error("Error listing users:", error);
    return res.status(500).json({ error: 'Unable to list users' });
  }
}

export async function registerUserGroup(req: Request, res: Response) {
  console.log("Í register usergro")

  const { child_id, user_id } = req.body;

  console.log("Þetta er child_id: ", child_id, " og userid: ", user_id)

  const result = await createUserGroup(child_id, user_id);

  if (!result) {
    return res.status(500).json({ error: 'unable to create usergroup' });
  }

  return res.json({
    result
  });
}

export async function createUserGroup(child_id: number, user_id: number) {

  const q = `
    INSERT INTO
      usergroup (child_id, user_id)
    VALUES
      ($1, $2)
    RETURNING *`;

  const values = [child_id, user_id];

  const result = await query(q, values);

  if (result) {
    return result.rows[0];
  }

  console.warn('unable to create usergroup');

  return false;
}

async function findGroupByChildId(id: number) {
  console.log("in findB")
  const q = 'SELECT * from usergroup where child_id = $1';

  const result = await query(q, [id]);

  if (result && result.rowCount === 1) {
    return result.rows[0];
  }

  console.error('Unable to find group by id', id);

  return null;
}

export async function returnChildGroup(req: Request, res: Response) {
  const { id } = req.params;

  const groupByChildId = await findGroupByChildId(Number(id));

  if (!groupByChildId) {
    return res.status(404).json({ error: 'Group not found' })
  }

  return res.status(201).json(groupByChildId)
}


export async function findById(id: number) {
  console.log("Er í findById í usergroup.ts");
  const q = 'SELECT * FROM usergroup WHERE id = $1';

  const result = await query(q, [id]);

  if (result && result.rowCount === 1) {
    return result.rows[0];
  }

  console.error('unable to find usergroup by id', id);

  return null;
}

export async function isAdmin(userid: number) {
  console.log(userid);
  const q = `SELECT admin FROM "usergroup" where id = $1`;
  const result = await query(q, [userid]);
  console.log('result', result);
  console.log(result?.rows[0].admin);
  if (result?.rows[0].admin === true) {
    return true;
  }
  else if (result?.rows[0].admin === false) return false;
}

export async function getUserGroupTypeReference(req: Request, res: Response) {
  const q = 'SELECT * FROM UserGroupTypeReference';

  try {
    const result = await query(q, []);

    if (result) {
      const userTypeReferences = result.rows;
      return res.status(200).json(userTypeReferences);
    } else {
      return res.status(500).json({ error: 'Internal server error' });
    }
  } catch (error) {
    console.error('Error fetching usergroup type references:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function postUserGroupTypeReference(req: Request, res: Response) {
  console.log("er í postusertypereference");
  const { type_name } = req.body;
  const { user } = req;

  if (!(await isAdmin(Number(user)))) {
    return res.status(500).json({ error: 'Unable to create usergroup type, only admins' });
  }

  const q = 'INSERT INTO UserGroupTypeReference (type_name) VALUES ($1) RETURNING *';

  try {
    const result = await query(q, [type_name]);

    if (result) {
      const userTypeReferences = result.rows;
      return res.status(200).json(userTypeReferences);
    } else {
      return res.status(500).json({ error: 'Internal server error' });
    }
  } catch (error) {
    console.error('Error inserting usergroup type reference:', error);
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
  mapOfUserGroupsToUserGroups,
  listUserGroups,
  registerUserGroup,
  createUserGroup,
  findById,
  isAdmin,
  getUserGroupTypeReference,
  postUserGroupTypeReference,
  findByTypeName,
};
