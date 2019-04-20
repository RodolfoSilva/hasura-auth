import jwt from 'jsonwebtoken';
import uniq from 'lodash/uniq';
import { User, Role } from './hasura';
import * as vars from './vars';

export const generateJwtToken = (user: User) => {
  const userRoles = uniq([
    user.default_role,
    ...user.roles.map((role: Role) => role.role),
  ]);

  const payload = {
    [vars.hasuraGraphqlClaimsKey]: {
      [`${vars.hasuraHeaderPrefix}allowed-roles`]: userRoles.join(','),
      [`${vars.hasuraHeaderPrefix}default-role`]: user.default_role,
      [`${vars.hasuraHeaderPrefix}role`]: user.default_role,
      [`${vars.hasuraHeaderPrefix}user-id`]: user.id.toString(),
    },
  };

  const jwtOptions: jwt.SignOptions = {
    algorithm: vars.jwtAlgorithm,
    expiresIn: vars.jwtTokenExpiresIn,
  };

  return jwt.sign(payload, vars.jwtSecretKey, jwtOptions);
};
