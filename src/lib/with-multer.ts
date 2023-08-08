import { NextFunction, Request, Response } from 'express';
import multer from 'multer';

// TODO færa í .env
const MULTER_TEMP_DIR = './temp';

/**
 * Hjálparfall til að bæta multer við route.
 */
export function withMulter(req: Request, res: Response, next: NextFunction) {
  multer({ dest: MULTER_TEMP_DIR }).single('image')(req, res, (err: any) => {
    console.log('test');
    if (err) {
      console.log('error 1', err)
      if (err.message === 'Unexpected field') {
        const errors = [
          {
            field: 'image',
            error: 'Unable to read image',
          },
        ];
        return res.status(400).json({ errors });
      }
      console.log('error 2', err)
      return next(err);
    }

    return next();
  });
}
