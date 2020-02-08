import gql from 'graphql-tag';
import createGraphqlClient from '../../helpers/create-graphql-client';

const hasuraClient = createGraphqlClient('http://hasura:8080/v1/graphql');
const authClient = createGraphqlClient('http://localhost:4000/graphql');

const insertInto = async (tableName: String, data: any) => {
  const response = await hasuraClient(
    `mutation ($object: [${tableName}_insert_input!]!) { insert_${tableName}(objects: $object) { returning { id } } }`,
    {
      object: data,
    },
  );

  return response?.data?.[`insert_${tableName}`]?.returning[0]?.id;
};

describe('User', () => {
  let organizationId: string;

  beforeAll(async () => {
    const result = await insertInto('organization', {
      name: 'Nasa',
    });

    organizationId = result;
  });

  it('should register a new user', async () => {
    const users = await hasuraClient(
      gql`
        query {
          user {
            id
          }
        }
      `,
      {},
    );

    expect(users.data.user).toHaveLength(0);

    const userEmail = 'example@email.com';

    const user = await authClient(
      gql`
        mutation(
          $organization_id: String
          $email: String!
          $password: String!
        ) {
          auth_register(
            organization_id: $organization_id
            email: $email
            password: $password
          ) {
            affected_rows
          }
        }
      `,
      {
        organization_id: organizationId,
        email: userEmail,
        password: 'TeaWithMe',
      },
    );

    expect(user).toEqual({ data: { auth_register: { affected_rows: 1 } } });

    const registredUser = await hasuraClient(
      gql`
        query($where: user_bool_exp!) {
          user {
            id
            email
          }
        }
      `,
      {
        where: {
          email: {
            _eq: userEmail,
          },
        },
      },
    );

    expect(registredUser.data.user).toHaveLength(1);
  });
});
