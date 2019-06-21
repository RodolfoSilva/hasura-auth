import fetch from 'node-fetch';
import memoize from 'lodash/memoize';
import { print } from 'graphql/language/printer';
import { DocumentNode } from 'graphql';
import * as vars from '../vars';

export const graphqlClient = async <TVariables = any, TData = any>(
  document: DocumentNode,
  variables: TVariables,
  headers?: any,
): Promise<TData> => {
  const response = await fetch(vars.hasuraGraphqlEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...headers,
    },
    body: JSON.stringify({
      query: print(document),
      variables,
    }),
  });

  return response.json();
};
