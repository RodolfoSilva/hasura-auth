import fetch from 'node-fetch';
import memoize from 'lodash/memoize';
import { print } from 'graphql/language/printer';
import { DocumentNode } from 'graphql';
import * as vars from '../vars';

const getDefaultHeaders = memoize(() => {
  const adminSecret = vars.hasuraGraphqlAdminSecret;

  if (!adminSecret) {
    throw Error(
      'The environment "HASURA_GRAPHQL_ADMIN_SECRET" has not provided',
    );
  }

  return Object.freeze({
    [`${vars.hasuraHeaderPrefix}admin-secret`]: adminSecret,
  });
});

export const hasuraQuery = async <TVariables = any, TData = any>(
  document: DocumentNode,
  variables: TVariables,
): Promise<TData> => {
  const response = await fetch(vars.hasuraGraphqlEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...getDefaultHeaders(),
    },
    body: JSON.stringify({
      query: print(document),
      variables,
    }),
  });

  return response.json();
};
