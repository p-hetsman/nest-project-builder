import { Injectable, NestMiddleware, Logger } from '@nestjs/common';

import { Request, Response, NextFunction } from 'express';

interface RequestWithId extends Request {
  id: string;
}

@Injectable()
export class LogRequestMiddleware implements NestMiddleware {
  use(req: RequestWithId, res: Response, next: NextFunction) {
    const { id, method, url } = req;
    Logger.log(`${id} ${method} ${url}`);

    next();
  }
}
