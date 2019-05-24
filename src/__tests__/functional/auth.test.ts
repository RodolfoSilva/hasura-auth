import gql from 'graphql-tag';
import { hasuraQuery } from '../../hasura/client';

test('Should create a new user', async () => {
  const MUTATION = gql`
    mutation($email: String!, $password: String!) {
        auth_register(email: $email, password: $password)
    }
    `;

    const response = await hasuraQuery(MUTATION, { email: 'example@email.com', password: 'm@ast3s3cr37' });

    console.log(response);
});