import dotenv from 'dotenv';
import { Registration, Speaker, User } from '../types';
dotenv.config();

const { BASE_TEST_URL = 'http://localhost:5000' } = process.env;

export const baseUrl = BASE_TEST_URL;

export async function methodAndParse(
  method: string,
  path: string | URL,
  data: Partial<Event | Registration | Speaker | User> | null | undefined = null
) {
  const url = new URL(path, baseUrl).toString();

  const options = { headers: { 'content-type': '' }, method, body: '' };

  if (method !== 'GET') {
    options.method = method;
  }

  if (data) {
    options.headers['content-type'] = 'application/json';
    options.body = JSON.stringify(data);
  }

  if (method === 'DELETE') {
    options.body = JSON.stringify({ 'content-type': 'application/json' });
  }

  let result;
  if (method === 'GET') {
    result = await fetch(url);
  } else {
    console.log(method);
    result = await fetch(url, options);
  }

  let json;

  try {
    json = await result.json();
  } catch (e) {
    console.error('unable to parse json', e);
  }

  return {
    result: json,
    status: result.status,
  };
}

export async function fetchAndParse(path: string | URL) {
  return methodAndParse('GET', path, null);
}

// data = input fyrir að búa til course eða department
export async function postAndParse(
  path: string | URL,
  data: Partial<Event | Registration | Speaker | User>
) {
  return methodAndParse('POST', path, data);
}

// data = partial input fyrir course eða department
export async function patchAndParse(
  path: string | URL,
  data: null | undefined | Partial<Event | Registration | Speaker | User>
) {
  return methodAndParse('PATCH', path, data);
}

// data = courseSlug eða departmentSlug
export async function deleteAndParse(
  path: string | URL,
  data: null | undefined
) {
  return methodAndParse('DELETE', path, data);
}
