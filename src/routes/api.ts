import cors from 'cors';
import express, { Request, Response } from 'express';
import { catchErrors } from '../lib/catchErorrs.js';
import { requireAdmin, requireAuthentication, requireUserInGroup } from '../lib/passport.js';
import {
  incidentValidation,
  pagingQuerystringValidator,
  registerValidation,
  userTypeReferenceValidator,
  validationCheck
} from '../lib/validations.js';
import { withMulter } from '../lib/with-multer.js';
import { User } from '../types.js';
import {
  createChild,
  deleteChild,
  getChild,
  listChildren,
} from './child.js';
import {
  deleteIncident,
  getIncidentId,
  getIncidentSlug,
  listIncidents,
  registerIncident,
  updateIncidentHandler,
} from './incident.js';
import {
  // currentUserRoute,
  findById,
  getUserTypeReference,
  listUsers,
  loginRoute,
  logoutRoute,
  postUserTypeReference,
  registerUser,
  returnUser
} from './user.js';
import { listUserGroups, registerUserGroup } from './usergroup.js';

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
        methods: ['GET', 'POST'],
      },
      User: {
        href: '/users',
        methods: ['GET', 'POST'],
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

export async function currentUserRoute(req: Request, res: Response) {
  // console.log("in currentUserRoute");
  // const authHeader = req.headers["authorization"];

  // if (!authHeader) {
  //   return res.status(401).json({ error: 'Authorization header missing' });
  // }

  // const token = authHeader.split(' ')[1];

  // if (!token) {
  //   return res.status(401).json({ error: 'Token not provided' });
  // }

  // jwt.verify(token, jwtSecret, async (err, user) => {
  //   if (err) {
  //     return res.status(403).json({ error: 'Token is not valid' });
  //   }

  //   const userId = (user as User).id; // Type assertion

  //   const userById = await findById(userId);

  //   if (!userById) {
  //     return res.status(404).json({ error: 'User not found' });
  //   }

  //   delete userById.password;

  //   return res.json(userById);
  // });
  const { id } = req.user as User;

  if (!id) {
    return res.status(400).json({ error: 'User id is missing' })
  }

  const user = await findById(id);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  delete user.password;

  return res.json(user);
}


router.get('/', index);

// sækja týpur af notendum
router.get(
  '/usertypes',
  catchErrors(getUserTypeReference)
);

// búa til nýja týpu af notendum
// TODO: bara fyrir admin
router.post(
  '/usertypes',
  userTypeReferenceValidator,
  validationCheck,
  requireAdmin,
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
  '/users/register',
  registerValidation,
  validationCheck,
  catchErrors(registerUser)
);

// skrá notanda inn
router.post(
  '/users/login',
  catchErrors(loginRoute)
);

// sækja öll atvik
// TODO: paging
router.get(
  '/incidents',
  pagingQuerystringValidator,
  validationCheck,
  catchErrors(listIncidents)
);

// sækja atvik eftir slug
router.get(
  '/incidents/:slug',
  pagingQuerystringValidator,
  validationCheck,
  catchErrors(getIncidentSlug)
);

// sækja atvik eftir id
router.get(
  '/incidents/:id',
  pagingQuerystringValidator,
  validationCheck,
  catchErrors(getIncidentId)
);

// ------------------------------------------

router.post(
  '/incidents',
  // requireAuthentication,
  incidentValidation,
  validationCheck,
  catchErrors(registerIncident)
);

router.post(
  '/users/logout',
  catchErrors(logoutRoute)
)

// nota paging með t.d. users?limit=2&offset=1
// router.get(
//   '/users',
//   pagingQuerystringValidator,
//   validationCheck,
//   catchErrors(listUsers)
// );



// router.post('/users/register', validationCheck, catchErrors(registerRoute));

// router.get('/users/me', requireAuthentication, catchErrors(currentUserRoute));
router.get('/users/me', requireAdmin, catchErrors(currentUserRoute));



router.get(
  '/users/inGroup',
  requireUserInGroup,
  catchErrors(currentUserRoute)
)


router.get('/users/:id', requireAuthentication, catchErrors(returnUser));

// tengja barn (í hópi) og notanda saman
router.post(
  '/usergroup',
  catchErrors(registerUserGroup)
);

// sækir allar tengingar barna og notenda
router.get(
  '/usergroup',
  catchErrors(listUserGroups)
);

// sækir allar tengingar barns með child_id id
router.get(
  '/usergroup/:id',
  catchErrors(listUserGroups)
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

