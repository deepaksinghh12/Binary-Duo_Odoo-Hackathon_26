import { AuthTokenPayload } from '../shared/types';

declare global {
  namespace Express {
    interface Request {
      user?: AuthTokenPayload;
    }
  }
}
export {};
