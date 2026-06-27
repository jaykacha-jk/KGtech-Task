import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    username: string;
  };
}

export interface ValidatedRequest<TBody = unknown, TParams = unknown, TQuery = unknown>
  extends Request {
  validated: {
    body: TBody;
    params: TParams;
    query: TQuery;
  };
}
