import gql from 'graphql-tag';

export const USER_FRAGMENT = gql`
  fragment UserParts on user {
    id
    email
    password
    is_active
    secret_token
    default_role
    user_roles {
      id
      role
    }
    created_at
    updated_at
  }
`;
