import { DocumentNode } from 'graphql';
import memoize from 'lodash/memoize';
import createGraphqlClient from '../helpers/create-graphql-client';
import * as vars from '../vars';

const getDefaultHeaders = memoize(() => {
  const adminSecret = vars.hasuraGraphqlAdminSecret;

  if (!adminSecret && process.env.NODE_ENV === 'production') {
    throw Error(
      'The environment "HASURA_GRAPHQL_ADMIN_SECRET" has not provided',
    );
  }

  return Object.freeze({
    [`${vars.hasuraHeaderPrefix}admin-secret`]: adminSecret,
  });
});

export const hasuraQuery = <ResponseT = any, VariableT = any>(
  document: DocumentNode | string,
  variables: VariableT,
) =>
  createGraphqlClient<ResponseT, VariableT>(vars.hasuraGraphqlEndpoint)(
    document,
    variables,
    {
      ...getDefaultHeaders(),
    },
  );
