import jwt from 'jsonwebtoken';
import { User } from './hasura';
import * as vars from './vars';

export const generateJwtAccessToken = (payload: any) => {
  const jwtOptions: jwt.SignOptions = {
    algorithm: vars.jwtAlgorithm,
    expiresIn: vars.jwtTokenExpiresIn,
  };

  return jwt.sign(payload, vars.jwtSecretKey, jwtOptions);
};

export const generateJwtRefreshToken = (payload: any) => {
  const jwtOptions: jwt.SignOptions = {
    algorithm: vars.jwtAlgorithm,
    expiresIn: vars.jwtRefreshTokenExpiresIn,
  };

  return jwt.sign(payload, vars.jwtSecretKey, jwtOptions);
};

export const generateClaimsJwtToken = (user: User, sessionId: string) => {
  const payload = {
    [vars.hasuraGraphqlClaimsKey]: {
      [`${vars.hasuraHeaderPrefix}allowed-roles`]: user.role,
      [`${vars.hasuraHeaderPrefix}default-role`]: user.role,
      [`${vars.hasuraHeaderPrefix}role`]: user.role,
      [`${vars.hasuraHeaderPrefix}user-id`]: user.id.toString(),
      [`${vars.hasuraHeaderPrefix}session-id`]: sessionId,
    },
  };

  return generateJwtAccessToken(payload);
};
