import gql from 'graphql-tag';

export const typeDefs = gql`
  type AuthPayload {
    accessToken: String!
    refreshToken: String!
    userId: ID!
  }

  type Role {
    id: String!
    user_id: String!
    role: String!
    created_at: String!
  }

  type User {
    id: ID!
    email: String!
    is_active: String!
    default_role: String!
    roles: [Role!]!
    created_at: String!
  }

  type Mutation {
    auth_login(email: String!, password: String!): AuthPayload
    auth_register(email: String!, password: String!): Boolean
    auth_change_password(user_id: ID!, new_password: String!): Boolean
    auth_activate_account(email: ID!, secret_token: String!): Boolean
    auth_refresh_token: AuthPayload
  }

  type Query {
    auth_me: User
  }

  schema {
    query: Query
    mutation: Mutation
  }
`;
