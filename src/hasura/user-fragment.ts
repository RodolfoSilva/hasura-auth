import gql from 'graphql-tag';

export const USER_FRAGMENT = gql`
  fragment UserParts on users {
    id
    email
    password
    is_active
    created_at
    secret_token
    default_role
    roles: user_roles {
      id
      user_id
      role
      created_at
    }
  }
`;
