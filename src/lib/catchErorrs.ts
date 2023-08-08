import { NextFunction, Request, Response } from 'express';

export function catchErrors(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>): (req: Request, res: Response, next: NextFunction) => Promise<any> {
  return (req, res, next) => fn(req, res, next).catch(next);
}
