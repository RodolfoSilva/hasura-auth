import uuidv4 from 'uuid/v4';
import fetch from 'node-fetch';
import dotEnvFlow from 'dotenv-flow';
import gql from 'graphql-tag';
import { print } from 'graphql/language/printer';
import { hasuraQuery } from '../../../hasura/client';

dotEnvFlow.config({
  node_env: 'test',
});

jest.mock('node-fetch');
const { Response } = jest.requireActual('node-fetch');

test('createUser calls fetch with the right args and returns the user id', async () => {
  const serverResponse = {
    data: {
      users: [
        {
          id: 'c108cf04-0971-47b1-a86a-3a4fcdbf624a',
          name: 'John Wick',
        },
      ],
    },
  };

  fetch.mockReturnValue(
    Promise.resolve(new Response(JSON.stringify(serverResponse))),
  );

  const USER_QUERY = gql`
    query($name: String!) {
      users(name: $name) {
        id
        name
      }
    }
  `;

  const response = await hasuraQuery(USER_QUERY, { name: 'John' });

  expect(fetch).toHaveBeenCalledTimes(1);

  expect(fetch).toHaveBeenCalledWith(expect.any(String), {
    method: 'POST',
    body: JSON.stringify({
      query: print(USER_QUERY),
      variables: { name: 'John' },
    }),
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'x-hasura-admin-secret': 'masterkey',
    },
  });

  expect(response).toEqual(serverResponse);
});
