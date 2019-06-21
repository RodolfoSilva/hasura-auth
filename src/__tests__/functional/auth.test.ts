import gql from 'graphql-tag';
import { hasuraQuery } from '../../hasura/client';
import { graphqlClient } from '../graphqlClient';

test('Should create a new user', async () => {
  const MUTATION = gql`
    mutation($email: String!, $password: String!) {
      auth_register(email: $email, password: $password)
    }
  `;

  const response = await graphqlClient(MUTATION, {
    email: 'example@email.com',
    password: 'm@ast3s3cr37',
  });

  console.log(JSON.stringify(response, void 0, 2));
});
