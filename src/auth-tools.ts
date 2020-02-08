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
      [`${vars.hasuraHeaderPrefix}role`]: user.role,
      [`${vars.hasuraHeaderPrefix}session-id`]: sessionId,
      [`${vars.hasuraHeaderPrefix}user-id`]: user.id.toString(),
      [`${vars.hasuraHeaderPrefix}organization-id`]:
        user.organization_id === null ? '' : user.organization_id,
    },
  };

  return generateJwtAccessToken(payload);
};
