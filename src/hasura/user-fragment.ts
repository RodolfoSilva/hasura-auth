import gql from 'graphql-tag';

export const USER_FRAGMENT = gql`
  fragment UserParts on user {
    id
    organization_id
    email
    password
    is_active
    role
    organization {
      id
      name
      created_at
      updated_at
    }
    created_at
    updated_at
  }
`;
