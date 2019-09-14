import gql from 'graphql-tag';

export const typeDefs = gql`
  type AuthPayload {
    access_token: String!
    refresh_token: String!
    user_id: ID!
    organization_id: String
  }

  type Organization {
    id: String!
    name: String!
    created_at: String!
    updated_at: String!
  }

  type Role {
    id: String!
    user_id: String!
    organization_id: String
    role: String!
    created_at: String!
  }

  type User {
    id: ID!
    organization_id: String!
    email: String!
    is_active: String!
    organization: Organization
    default_role: String!
    user_roles: [Role!]!
    created_at: String!
  }

  type AffectedRows {
    affected_rows: Int!
  }

  type Mutation {
    auth_login(
      organization_id: String
      email: String!
      password: String!
    ): AuthPayload
    auth_register(
      organization_id: String
      email: String!
      password: String!
    ): AffectedRows
    auth_change_password(user_id: ID!, new_password: String!): AffectedRows
    auth_activate_account(
      organization_id: String
      email: ID!
      secret_token: String!
    ): AffectedRows
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
