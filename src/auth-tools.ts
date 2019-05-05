import jwt from 'jsonwebtoken';
import { User } from './hasura';
import * as vars from './vars';

export const generateJwtToken = (user: User) => {
  const payload = {
    [vars.hasuraGraphqlClaimsKey]: {
      [`${vars.hasuraHeaderPrefix}allowed-roles`]: user.role,
      [`${vars.hasuraHeaderPrefix}default-role`]: user.role,
      [`${vars.hasuraHeaderPrefix}role`]: user.role,
      [`${vars.hasuraHeaderPrefix}user-id`]: user.id.toString(),
    },
  };

  const jwtOptions: jwt.SignOptions = {
    algorithm: vars.jwtAlgorithm,
    expiresIn: vars.jwtTokenExpiresIn,
  };

  return jwt.sign(payload, vars.jwtSecretKey, jwtOptions);
};
