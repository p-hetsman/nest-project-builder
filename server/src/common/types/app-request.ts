import { Request } from 'express';

export type AppRequest = Request & {
  id?: string;
  user?: {
    id: number;
  };
};
