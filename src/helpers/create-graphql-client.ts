import { DocumentNode } from 'graphql';
import { print } from 'graphql/language/printer';
import fetch, { HeadersInit } from 'node-fetch';

type GraphqlResponse<T> = {
  data: T;
  errors: any[];
};

export default function createGraphqlClient<ResponseT = any, VariableT = any>(
  url: string,
) {
  return async (
    query: string | DocumentNode,
    variables: VariableT = {} as any,
    headers?: HeadersInit,
  ): Promise<GraphqlResponse<ResponseT>> => {
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify({
        query: typeof query === 'string' ? query : print(query),
        variables,
      }),
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...headers,
      },
    });

    return response.json();
  };
}
