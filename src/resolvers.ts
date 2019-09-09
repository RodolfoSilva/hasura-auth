import jwt from 'jsonwebtoken';
import getIn from 'lodash/get';
import getIntersection from 'lodash/intersection';
import isEmpty from 'lodash/isEmpty';
import { Request } from 'express';
import * as vars from './vars';
import { generateClaimsJwtToken, generateJwtRefreshToken } from './auth-tools';
import {
  User,
  createUserSession,
  createUserAccount,
  getUserById,
  changeUserPassword,
  activateUser,
  getUserByIdAndRefreshToken,
  getUserByCredentials,
} from './hasura';

const getRole = (req: Request) => getIn(req, `headers["${vars.hasuraHeaderPrefix}role"]`, '');
const isAdmin = (req: Request) => getRole(req) === 'admin';

const getDataFromVerifiedAuthorizationToken = (req: Request): undefined | any => {
  const { authorization } = req.headers;

  if (authorization === undefined) {
    return void 0;
  }

  const token = authorization.replace('Bearer ', '');

  try {
    return jwt.verify(token, vars.jwtSecretKey);
  } catch (e) {
    return void 0;
  }
};

const getFieldFromDataAuthorizationToken = (req: Request, field) => {
  const verifiedToken: any = getDataFromVerifiedAuthorizationToken(req);

  return getIn(verifiedToken, `["${vars.hasuraGraphqlClaimsKey}"]${vars.hasuraHeaderPrefix}${field}`);
};

const getCurrentUserId = (req: Request) => getFieldFromDataAuthorizationToken(req, 'user-id');

const isAuthenticated = (req: Request): boolean => {
  return !!getDataFromVerifiedAuthorizationToken(req);
};

const checkUserCanDoRegistration = (req: Request): boolean => {
  if (isAdmin(req)) {
    return true;
  }

  if (vars.allowRegistrationFor !== '*') {
    const allowedRoles = vars.allowRegistrationFor.split(',');
    return allowedRoles.includes(getRole(req));
  }

  return true;
};

const checkUserIsPartOfStaffOrIsTheCurrentUser = (
  req: Request,
  userId: string,
): boolean => {
  if (isAdmin(req)) {
    return true;
  }

  const roles = getIn(req, `headers["${vars.hasuraHeaderPrefix}role"]`, '')
    .split(',')
    .map((role: string) => role.trim());

  if (getIntersection(roles, ['admin']).length >= 1) {
    return true;
  }

  if (!isAuthenticated(req)) {
    return false;
  }

  try {
    const currentUserId = getCurrentUserId(req);
    return currentUserId === userId;
  } catch (e) {
    return false;
  }
};

const resolvers = {
  Query: {
    async auth_me(_, args, ctx) {
      if (!isAuthenticated(ctx.req)) {
        throw new Error('Authorization token has not provided');
      }

      try {
        const currentUserId = getCurrentUserId(ctx.req);

        return getUserById(currentUserId);
      } catch (e) {
        throw new Error('Not logged in.');
      }
    },
  },
  Mutation: {
    async auth_login(_, { email, password }, ctx) {
      const user: User = await getUserByCredentials(email, password);

      const ipAddress = (
        ctx.req.headers['x-forwarded-for'] ||
        ctx.req.connection.remoteAddress ||
        ''
      )
        .split(',')[0]
        .trim();

      const [refreshToken, sessionId] = await createUserSession(
        user,
        ctx.req.headers['user-agent'],
        ipAddress,
      );

      const accessToken = generateClaimsJwtToken(user, sessionId);

      return {
        accessToken,
        refreshToken: generateJwtRefreshToken({
          token: refreshToken,
        }),
        userId: user.id,
      };
    },
    async auth_register(_, { email, password }, ctx) {
      if (!checkUserCanDoRegistration(ctx.req)) {
        throw new Error('Forbidden');
      }
      const user = await createUserAccount(email, password);
      return user !== undefined;
    },
    async auth_change_password(_, { user_id, new_password }, ctx) {
      if (!checkUserIsPartOfStaffOrIsTheCurrentUser(ctx.req, user_id)) {
        throw new Error('Forbidden');
      }

      const user: User | undefined = await getUserById(user_id);

      if (!user) {
        throw new Error('Unable to find user.');
      }

      return await changeUserPassword(user, new_password);
    },
    async auth_activate_account(_, { email, secret_token }) {
      if (isEmpty(email)) {
        throw new Error('Invalid email');
      }

      if (isEmpty(secret_token)) {
        throw new Error('Invalid secret_token');
      }

      return await activateUser(email, secret_token);
    },
    async auth_refresh_token(_, {}, ctx) {
      const { authorization } = ctx.req.headers;
      const refreshToken = ctx.req.headers['x-refresh-token'];

      if (!authorization) {
        throw new Error('Authorization token has not provided');
      }

      if (!refreshToken) {
        throw new Error('Refresh token has not provided');
      }

      const payload: any = jwt.decode(authorization.split(' ')[1]);

      const refreshTokenPayload: any = jwt.verify(
        refreshToken,
        vars.jwtSecretKey,
      );

      const userId = getIn(
        payload,
        `["${vars.hasuraGraphqlClaimsKey}"]${vars.hasuraHeaderPrefix}user-id`,
      );

      const user = await getUserByIdAndRefreshToken(
        userId,
        refreshTokenPayload.token,
      );

      const ipAddress = (
        ctx.req.headers['x-forwarded-for'] ||
        ctx.req.connection.remoteAddress ||
        ''
      )
        .split(',')[0]
        .trim();

      const [newRefreshToken, sessionId] = await createUserSession(
        user,
        ctx.req.headers['user-agent'],
        ipAddress,
      );

      const accessToken = generateClaimsJwtToken(user, sessionId);

      return {
        accessToken,
        refreshToken: generateJwtRefreshToken({
          token: newRefreshToken,
        }),
        userId,
      };
    },
  },
};

export default resolvers;
