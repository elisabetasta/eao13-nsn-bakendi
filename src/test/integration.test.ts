import { describe, expect, test } from '@jest/globals';
import axios from 'axios';
import dotenv from 'dotenv';
import { fetchAndParse, postAndParse } from './utils';

dotenv.config({ path: './.env.test' });

describe('integration', () => {
  test('GET /departments returns 200', async () => {
    const result = await fetchAndParse('/events');
    expect(result.status).toBe(200);
  });

  let token = '';

  it('should create a new admin user', async () => {
    const newUser = {
      name: "Notandi Notandason",
      username: "notandason12",
      password: "1234567890",
      admin: true
    }
    const result = await postAndParse('/users/register', newUser)
    token = result.result.token;
    expect((await result).status).toBe(200);
  });

  it('should set bearer token in Authorization header', async () => {
    const postData = {
      title: "Viðburður nýr",
      description: "Þessi viðburður er nýr af nálinni."
    };

    const headers = {
      'Authorization': `Bearer ${token}`
    };

    const response = await axios.post('http://localhost:5000/events', postData, { headers });
    expect(response.status).toBe(201);
  });

  test('GET /events/honnudahittingur-i-mars', async () => {
    const result = await fetchAndParse('/events/honnudahittingur-i-mars');
    expect(result.status).toBe(200);
  });
});

