import dotenv from 'dotenv';
import express from 'express';
import passport from 'passport';
import { router } from './routes/api.js';

dotenv.config();

const app = express();

app.use(passport.initialize());
app.use(express.json());
app.use(router);

const port = 3017;

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
