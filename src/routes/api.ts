import cors from 'cors';
import express, { Request, Response } from 'express';
import { catchErrors } from '../lib/catchErorrs.js';
import { requireAuthentication } from '../lib/passport.js';
import {
  incidentValidation,
  pagingQuerystringValidator,
  userTypeReferenceValidator,
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
  getUserTypeReference,
  listUsers,
  loginRoute,
  postUserTypeReference,
  registerUser,
  returnUser
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
      UserTypeReference: {
        href: '/user-type-reference',
        methods: ['GET', 'POST', 'PATCH', 'DELETE'],
      },
      IncidentFeedbackReference: {
        href: '/incident-feedback-reference',
        methods: ['GET', 'POST', 'PATCH', 'DELETE'],
      },
      User: {
        href: '/users',
        methods: ['GET', 'POST', 'PATCH', 'DELETE'],
      },
      Incident: {
        href: '/incidents',
        methods: ['GET', 'POST', 'PATCH', 'DELETE'],
      },
      Child: {
        href: '/children',
        methods: ['GET', 'POST', 'PATCH', 'DELETE'],
      },
      UserGroups: {
        href: '/user-groups',
        methods: ['GET', 'POST', 'DELETE'],
      },
    },
    adminRoutes: {
      UserTypeReference: {
        href: '/admin/user-type-reference',
        methods: ['POST', 'PATCH', 'DELETE'],
      },
      IncidentFeedbackReference: {
        href: '/admin/incident-feedback-reference',
        methods: ['POST', 'PATCH', 'DELETE'],
      },
      User: {
        href: '/admin/users',
        methods: ['POST', 'PATCH', 'DELETE'],
      },
      Incident: {
        href: '/admin/incidents',
        methods: ['POST', 'PATCH', 'DELETE'],
      },
      Child: {
        href: '/admin/children',
        methods: ['POST', 'PATCH', 'DELETE'],
      },
      UserGroups: {
        href: '/admin/user-groups',
        methods: ['POST', 'DELETE'],
      },
    },
  });
}


router.get('/', index);

// sækja týpur af notendum
router.get(
  '/usertypes',
  catchErrors(getUserTypeReference)
);

// búa til nýja týpu af notendum
router.post(
  '/usertypes',
  userTypeReferenceValidator,
  validationCheck,
  catchErrors(postUserTypeReference)
);

// sækja alla notendur
// TODO: þarf að gera bara fyrir admin
router.get(
  '/users',
  validationCheck,
  catchErrors(listUsers)
);

// búa til notanda
// TODO: bara aðgengilegt í gegnum "sign-up síðu"
router.post(
  '/users',
  validationCheck,
  catchErrors(registerUser)
)

// ------------------------------------------

// nota paging með t.d. users?limit=2&offset=1
// router.get(
//   '/users',
//   pagingQuerystringValidator,
//   validationCheck,
//   catchErrors(listUsers)
// );

router.post('/users/login', catchErrors(loginRoute));

// router.post('/users/register', validationCheck, catchErrors(registerRoute));

router.get('/users/me', requireAuthentication, catchErrors(currentUserRoute));


router.get('/users/:id', requireAuthentication, catchErrors(returnUser));


router.get(
  '/incidents',
  pagingQuerystringValidator,
  validationCheck,
  catchErrors(listIncidents)
);


router.get(
  '/incidents/:slug',
  pagingQuerystringValidator,
  validationCheck,
  catchErrors(getIncident)
);


router.delete(
  '/incidents/:slug',
  requireAuthentication,
  pagingQuerystringValidator,
  validationCheck,
  catchErrors(deleteIncident)
);


router.patch(
  '/incidents/:slug',
  requireAuthentication,
  pagingQuerystringValidator,
  validationCheck,
  catchErrors(updateIncidentHandler)
);


router.post(
  '/incidents',
  requireAuthentication,
  incidentValidation,
  validationCheck,
  catchErrors(registerIncident)
);


router.get(
  '/incidents/:slug/child',
  pagingQuerystringValidator,
  validationCheck,
  catchErrors(listChildren)
);


router.post(
  '/incidents/:slug/child',
  requireAuthentication,
  withMulter,
  requireAuthentication,
  catchErrors(createChild)
);


router.get(
  '/incidents/:slug/child/:id',
  requireAuthentication,
  validationCheck,
  catchErrors(getChild)
);


router.delete(
  '/incidents/:slug/child/:id',
  requireAuthentication,
  catchErrors(deleteChild)
);

