import { NextFunction, Request, Response } from 'express';
import { body, query, validationResult } from 'express-validator';
import { findByIncidentSlug } from '../routes/incident.js';
import { findByTypeName, findByUsername } from '../routes/user.js';

export function validationCheck(req: Request, res: Response, next: NextFunction) {
  const validation = validationResult(req);

  if (!validation.isEmpty()) {
    const errors = validation.array();
    const notFoundError = errors.find(
      (error) => error.msg === 'not found'
    );
    const serverError = errors.find(
      (error) => error.msg === 'server error'
    );

    // We loose the actual error object of LoginError, match with error message
    const loginError = errors.find(
      (error) => error.msg === 'username or password incorrect'
    );

    let status = 400;

    if (serverError) {
      status = 500;
    } else if (notFoundError) {
      status = 404;
    } else if (loginError) {
      status = 401;
    }

    return res.status(status).json({ errors: errors });
  }

  return next();
}

export const registerValidation = [
  body('username')
    .isLength({ min: 1, max: 64 })
    .withMessage('username is required, max 256 characters'),
  body('name')
    .isLength({ min: 1, max: 64 })
    .withMessage('name is required, max 128 characters'),
  body('password')
    .isLength({ min: 10, max: 256 })
    .withMessage('password is required, min 10 characters, max 256 characters'),
  body('username').custom(async (username) => {
    const user = await findByUsername(username);
    if (user) {
      return Promise.reject(new Error('username already exists'));
    }
    return Promise.resolve();
  }),
];

export const incidentValidation = [
  body('title')
    .isLength({ min: 1, max: 64 })
    .withMessage('title is required, max 64 characters'),
  body('description')
    .isLength({ min: 1, max: 1000 })
    .withMessage('description is required, max 1000 characters'),
  body('slug').custom(async (slug) => {
    const event = await findByIncidentSlug(slug); // find by slug ætti að kalla á
    if (event) {
      return Promise.reject(new Error('event already exists'));
    }
    return Promise.resolve();
  }),
];



export const pagingQuerystringValidator = [
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('query parameter "offset" must be an int, 0 or larget'),
  query('limit')
    .optional()
    .isInt({ min: 1 })
    .withMessage('query parameter "limit" must be an int, larger than 0'),
];

// ------------------------------------------
export const userTypeReferenceValidator = [
  body('type_name')
    .isLength({ min: 1, max: 50 })
    .withMessage('type_name is required, max 50 characters')
    .custom(async (type_name) => {
      const type = await findByTypeName(type_name);
      if (type) {
        return Promise.reject(new Error('type already exists'));
      }
      return Promise.resolve();
    })
]
