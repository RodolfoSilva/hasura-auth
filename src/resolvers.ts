import jwt from 'jsonwebtoken';
import getIn from 'lodash/get';
import getIntersection from 'lodash/intersection';
import isEmpty from 'lodash/isEmpty';
import { Request } from 'express';
import * as vars from './vars';
import { generateClaimsJwtToken, generateJwtToken } from './auth-tools';
import {
  User,
  createUserSession,
  createUserAccount,
  getUserById,
  changeUserPassword,
  activateUser,
  getUserByIdAndRefreshToken,
  updateUserRefreshToken,
  getUserByCredentials,
} from './hasura';

const checkUserIsPartOfStaffOrIsTheCurrentUser = (
  req: Request,
  userId: string,
): boolean => {
  if (
    req.headers[`${vars.hasuraHeaderPrefix}admin-secret`] ===
    vars.hasuraGraphqlAdminSecret
  ) {
    return true;
  }

  const roles = getIn(req, `headers["${vars.hasuraHeaderPrefix}role"]`, '')
    .split(',')
    .map((role: string) => role.trim());

  if (getIntersection(roles, ['admin']).length >= 1) {
    return true;
  }

  const { authorization } = req.headers;

  if (authorization === undefined) {
    return false;
  }

  try {
    const verifiedToken: any = jwt.verify(
      authorization.replace('Bearer ', ''),
      vars.jwtSecretKey,
    );

    const currentUserId = getIn(
      verifiedToken,
      `["${vars.hasuraGraphqlClaimsKey}"]${vars.hasuraHeaderPrefix}user-id`,
    );
    console.log(currentUserId);

    return currentUserId === userId;
  } catch (e) {
    console.log(e);
    return false;
  }
};

const resolvers = {
  Query: {
    async auth_me(_, args, ctx) {
      const { authorization } = ctx.req.headers;

      if (!authorization) {
        throw new Error('Authorization token has not provided');
      }

      try {
        const token = authorization.replace('Bearer ', '');
        const verifiedToken: any = jwt.verify(token, vars.jwtSecretKey);

        const userId = getIn(
          verifiedToken,
          `["${vars.hasuraGraphqlClaimsKey}"]${vars.hasuraHeaderPrefix}user-id`,
        );

        return getUserById(userId);
      } catch (e) {
        throw new Error('Not logged in.');
      }
    },
  },
  Mutation: {
    async auth_login(_, { email, password }, ctx) {
      const user: User = await getUserByCredentials(email, password);

      const accessToken = generateClaimsJwtToken(user);

      const ipAddress = (
        ctx.req.headers['x-forwarded-for'] ||
        ctx.req.connection.remoteAddress ||
        ''
      )
        .split(',')[0]
        .trim();

      const refreshToken = await createUserSession(
        user,
        ctx.req.headers['user-agent'],
        ipAddress,
      );

      return {
        accessToken,
        refreshToken,
        userId: user.id,
      };
    },
    async auth_register(_, { email, password }) {
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

      const userId = getIn(
        payload,
        `["${vars.hasuraGraphqlClaimsKey}"]${vars.hasuraHeaderPrefix}user-id`,
      );

      const user = await getUserByIdAndRefreshToken(userId, refreshToken);

      // const newRefreshToken = updateUserRefreshToken(user, refreshToken);
      const ipAddress = (
        ctx.req.headers['x-forwarded-for'] ||
        ctx.req.connection.remoteAddress ||
        ''
      )
        .split(',')[0]
        .trim();

      const newRefreshToken = await createUserSession(
        user,
        ctx.req.headers['user-agent'],
        ipAddress,
      );

      const accessToken = generateClaimsJwtToken(user, refreshToken);

      return {
        accessToken,
        refreshToken: newRefreshToken,
        userId,
      };
    },
  },
};

export default resolvers;
