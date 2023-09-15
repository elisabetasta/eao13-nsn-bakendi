import { NextFunction, Request, Response } from 'express';
import passport from 'passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { findById } from '../routes/user.js';
import { User } from '../types.js';

const { JWT_SECRET: jwtSecret, TOKEN_LIFETIME: tokenLifetime = '3600' } = process.env;

if (!jwtSecret) {
  console.error('Vantar .env gildi');
  process.exit(1);
}

async function strat(data: User, next: any) {
  console.log("í strat data er: ", data)
  // fáum id gegnum data sem geymt er í token
  const user = await findById(data.id);
  console.log("testum og finnum user", user)

  if (user) {
    next(null, user);
  } else {
    next(null, false);
  }
}


export function requireAuthentication(req: Request, res: Response, next: NextFunction) {
  return passport.authenticate('jwt', { session: false }, (err: Error, user: User, info: any) => {
    if (err) {
      return next(err);
    }
    console.log('user: ', user)
    if (!user) {
      const error =
        info.name === 'TokenExpiredError' ? 'expired token' : 'invalid token';

      return res.status(401).json({ error });
    }

    // Látum notanda vera aðgengilegan í rest af middlewares
    req.user = user;
    console.log('req, user', req.user);
    return next();
  })(req, res, next);
}

export function addUserIfAuthenticated(req: Request, res: Response, next: NextFunction) {
  return passport.authenticate('jwt', { session: false }, (err: Error, user: User) => {
    if (err) {
      return next(err);
    }

    if (user) {
      req.user = user;
    }

    return next();
  })(req, res, next);
}



export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  console.log("Tester");
  return passport.authenticate('jwt', { session: false }, (err: Error, user: User, info: any) => {
    console.log('í reqAdmin og user er: ', user, " og admin á user er: ", user.admin)
    if (err) {
      return next(err);
    }

    if (!user) {
      const error =
        info.name === 'TokenExpiredError' ? 'expired token' : 'invalid token';

      return res.status(401).json({ error });
    }

    if (!user.admin) {
      const error = 'insufficient authorization';
      return res.status(401).json({ error });
    }

    // Látum notanda vera aðgengilegan í rest af middlewares
    req.user = user;
    console.log("req,", req.user);
    return next();
  })(req, res, next);
}

export function requireUserInGroup(req: Request, res: Response, next: NextFunction) {
  console.log("is user in group?");
  return passport.authenticate('jwt', { session: false }, (err: Error, user: User, info: any) => {
    // console.log('í reqAdmin og user er: ', user, " og admin á user er: ", user.admin)
    if (err) {
      return next(err);
    }

    if (!user) {
      const error =
        info.name === 'TokenExpiredError' ? 'expired token' : 'invalid token';

      return res.status(401).json({ error });
    }

    else if (user) {
      console.log("Það er til notandi!")
      // const isInGroup = await
    }

    // if (!user.admin) {
    //   const error = 'insufficient authorization';
    //   return res.status(401).json({ error });
    // }

    // Látum notanda vera aðgengilegan í rest af middlewares
    req.user = user;
    // console.log("req,", req.user);
    return next();
  })(req, res, next);
}

export const tokenOptions = { expiresIn: parseInt(tokenLifetime, 10) };

export const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: jwtSecret,
};

passport.use(new Strategy(jwtOptions, strat));

export default passport;
