import cors from 'cors';
import express, { Request, Response } from 'express';
import { catchErrors } from '../lib/catchErorrs.js';
import { requireAuthentication } from '../lib/passport.js';
import {
  eventValidation,
  pagingQuerystringValidator,
  validationCheck,
} from '../lib/validations.js';
import { withMulter } from '../lib/with-multer.js';
import {
  deleteEvent,
  getEvent,
  listEvents,
  registerEvent,
  updateEventHandler,
} from './event.js';
import {
  deleteRegister,
  getRegister,
  listRegistrations,
  registerUserMiddleware,
} from './registration.js';
import {
  createSpeaker,
  deleteSpeaker,
  getSpeaker,
  listSpeakers,
} from './speaker.js';
import {
  currentUserRoute,
  listUsers,
  loginRoute,
  registerRoute,
  returnUser,
} from './user.js';

export const router = express.Router();

// Svo hægt er að fetcha af framenda
// origin má breytast til að einungis sé hægt að fetcha af ákveðinni slóð
router.use(cors({ origin: '*' }));

// Pakki til að höndla file-a
//router.use(fileUpload());

// router.use(bodyParser.urlencoded({ extended: true }));

export async function index(req: Request, res: Response) {
  return res.json({
    routes: {
      events: {
        href: '/events',
        methods: ['GET'],
      },
      event: {
        href: '/events/:slug',
        methods: ['GET'],
      },
      registrations: {
        href: '/events/:slug/registrations',
        methods: ['GET', 'POST'],
      },
      registration: {
        href: '/events/:slug/registrations/:id',
        methods: ['GET', 'DELETE'],
      },
      speakers: {
        href: '/events/:slug/speaker',
        methods: ['GET'],
      },
      speaker: {
        href: '/events/:slug/speaker/:id',
        methods: ['GET'],
      },

      register: {
        href: '/users/register',
        methods: ['POST'],
      },
      login: {
        href: '/users/login',
        methods: ['POST'],
      },
    },
    adminRoutes: {
      events: {
        href: '/events',
        methods: ['GET', 'POST'],
      },
      event: {
        href: '/events/:slug',
        methods: ['GET', 'PATCH', 'DELETE'],
      },
      registrations: {
        href: '/events/:slug/registrations',
        methods: ['GET', 'POST'],
      },
      registration: {
        href: '/events/:slug/registrations/:id',
        methods: ['GET', 'DELETE'],
      },
      speakers: {
        href: '/events/:slug/speaker',
        methods: ['GET', 'POST'],
      },
      speaker: {
        href: '/events/:slug/speaker/:id',
        methods: ['GET', 'DELETE'],
      },
      users: {
        href: '/users',
        methods: ['GET'],
      },
      user: {
        href: '/users/:userSlug',
        methods: ['GET'],
      },
      register: {
        href: '/users/register',
        methods: ['POST'],
      },
      login: {
        href: '/users/login',
        methods: ['POST'],
      },
    },
  });
}

// Staðfest - allir
router.get('/', index);

// Staðfest - bara admin
// nota paging með t.d. users?limit=2&offset=1
router.get(
  '/users',
  pagingQuerystringValidator,
  validationCheck,
  catchErrors(listUsers)
);

// Staðfest - allir
router.post('/users/login', catchErrors(loginRoute));

// Staðfest - allir
router.post('/users/register', validationCheck, catchErrors(registerRoute));

// Staðfest - Sa sem er loggadur inn
router.get('/users/me', requireAuthentication, catchErrors(currentUserRoute));

// Staðfest - allir
router.get('/users/:id', requireAuthentication, catchErrors(returnUser));

// Staðfest - allir
router.get(
  '/events',
  pagingQuerystringValidator,
  validationCheck,
  catchErrors(listEvents)
);

// Staðfest - allir
router.get(
  '/events/:slug',
  pagingQuerystringValidator,
  validationCheck,
  catchErrors(getEvent)
);

// Staðfest - bara admin
router.delete(
  '/events/:slug',
  requireAuthentication,
  pagingQuerystringValidator,
  validationCheck,
  catchErrors(deleteEvent)
);

// Staðfest - bara admin
router.patch(
  '/events/:slug',
  requireAuthentication,
  pagingQuerystringValidator,
  validationCheck,
  catchErrors(updateEventHandler)
);

// Staðfest- bara admin
router.post(
  '/events',
  requireAuthentication,
  eventValidation,
  validationCheck,
  catchErrors(registerEvent)
);

// Staðfest - allir
router.get(
  '/events/:slug/speaker',
  pagingQuerystringValidator,
  validationCheck,
  catchErrors(listSpeakers)
);

// Staðfest - only admin
router.post(
  '/events/:slug/speaker',
  requireAuthentication,
  withMulter,
  requireAuthentication,
  catchErrors(createSpeaker)
);

// Staðfest - only admin
router.get(
  '/events/:slug/speaker/:id',
  requireAuthentication,
  validationCheck,
  catchErrors(getSpeaker)
);

// Staðfest - only admin
router.delete(
  '/events/:slug/speaker/:id',
  requireAuthentication,
  catchErrors(deleteSpeaker)
);

// Staðfest - allir
router.get('/events/:slug/registrations', catchErrors(listRegistrations));

// Fá aðra til að staðfesta, sá sem er loggaður inn
router.post(
  '/events/:slug/registrations',
  // registerValidation,
  requireAuthentication,
  validationCheck,
  catchErrors(registerUserMiddleware)
);

// Fá aðra til að staðfesta, allir
router.get('/events/:slug/registrations/:id', catchErrors(getRegister));

// Fá aðra til að staðfesta, only admin
router.delete(
  '/events/:slug/registrations/:id',
  requireAuthentication,
  catchErrors(deleteRegister)
);
