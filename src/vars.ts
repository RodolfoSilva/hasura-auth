import dotEnvFlow from 'dotenv-flow';

dotEnvFlow.config({
  node_env: process.env.NODE_ENV,
  default_node_env: 'development',
});

export const hasuraGraphqlEndpoint = process.env
  .HASURA_GRAPHQL_ENDPOINT as string;
export const hasuraGraphqlAdminSecret = process.env
  .HASURA_GRAPHQL_ADMIN_SECRET as string;
export const hasuraGraphqlClaimsKey = process.env
  .HASURA_GRAPHQL_CLAIMS_KEY as string;
export const hasuraHeaderPrefix = process.env.HASURA_GRAPHQL_HEADER_PREFIX;
export const jwtAlgorithm = process.env.JWT_ALGORITHM as string;
export const jwtTokenExpiresIn = `${process.env.JWT_TOKEN_EXPIRES as string}m`;
export const jwtSecretKey = process.env.JWT_PRIVATE_KEY as string;
export const refreshTokenExpiresIn = Number(process.env
  .REFRESH_TOKEN_EXPIRES_IN as string);
export const port = Number(process.env.PORT as string);
export const userRegistrationAutoActive = Boolean(
  process.env.USER_REGISTRATION_AUTO_ACTIVE,
);
