import { User } from './hasura';
import { Request } from 'express';

export function isUserAllowedToChangePassword(
  currentUserId: string,
  user: User,
  req: Request,
) {
  return false;
}
