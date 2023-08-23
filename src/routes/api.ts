import cors from 'cors';
import express, { Request, Response } from 'express';
import { catchErrors } from '../lib/catchErorrs.js';
import { requireAuthentication } from '../lib/passport.js';
import {
  incidentValidation,
  pagingQuerystringValidator,
  validationCheck,
} from '../lib/validations.js';
import { withMulter } from '../lib/with-multer.js';
import {
  createChild,
  deleteChild,
  getChild,
  listChildren,
} from './child.js';
import {
  deleteIncident,
  getIncident,
  listIncidents,
  registerIncident,
  updateIncidentHandler,
} from './incident.js';
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
      incidents: {
        href: '/incidents',
        methods: ['GET'],
      },
      incident: {
        href: '/incidents/:slug',
        methods: ['GET'],
      },
      registrations: {
        href: '/incidents/:slug/registrations',
        methods: ['GET', 'POST'],
      },
      registration: {
        href: '/incidents/:slug/registrations/:id',
        methods: ['GET', 'DELETE'],
      },
      child: {
        href: '/incidents/:slug/child',
        methods: ['GET'],
      },
      child_id: {
        href: '/incidents/:slug/child/:id',
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
      incidents: {
        href: '/incidents',
        methods: ['GET', 'POST'],
      },
      incident: {
        href: '/incidents/:slug',
        methods: ['GET', 'PATCH', 'DELETE'],
      },
      registrations: {
        href: '/incidents/:slug/registrations',
        methods: ['GET', 'POST'],
      },
      registration: {
        href: '/incidents/:slug/registrations/:id',
        methods: ['GET', 'DELETE'],
      },
      child: {
        href: '/incidents/:slug/child',
        methods: ['GET', 'POST'],
      },
      child_id: {
        href: '/incidents/:slug/child/:id',
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
  '/incidents',
  pagingQuerystringValidator,
  validationCheck,
  catchErrors(listIncidents)
);

// Staðfest - allir
router.get(
  '/incidents/:slug',
  pagingQuerystringValidator,
  validationCheck,
  catchErrors(getIncident)
);

// Staðfest - bara admin
router.delete(
  '/incidents/:slug',
  requireAuthentication,
  pagingQuerystringValidator,
  validationCheck,
  catchErrors(deleteIncident)
);

// Staðfest - bara admin
router.patch(
  '/incidents/:slug',
  requireAuthentication,
  pagingQuerystringValidator,
  validationCheck,
  catchErrors(updateIncidentHandler)
);

// Staðfest- bara admin
router.post(
  '/incidents',
  requireAuthentication,
  incidentValidation,
  validationCheck,
  catchErrors(registerIncident)
);

// Staðfest - allir
router.get(
  '/incidents/:slug/child',
  pagingQuerystringValidator,
  validationCheck,
  catchErrors(listChildren)
);

// Staðfest - only admin
router.post(
  '/incidents/:slug/child',
  requireAuthentication,
  withMulter,
  requireAuthentication,
  catchErrors(createChild)
);

// Staðfest - only admin
router.get(
  '/incidents/:slug/child/:id',
  requireAuthentication,
  validationCheck,
  catchErrors(getChild)
);

// Staðfest - only admin
router.delete(
  '/incidents/:slug/child/:id',
  requireAuthentication,
  catchErrors(deleteChild)
);

