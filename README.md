# Hasura Auth [WIP]

Inspired by the [hasura-backend-plus](https://github.com/elitan/hasura-backend-plus)

[![](https://images.microbadger.com/badges/image/rodolfosilva/hasura-auth.svg)](https://microbadger.com/images/rodolfosilva/hasura-auth 'Get your own image badge on microbadger.com')
[![](https://images.microbadger.com/badges/version/rodolfosilva/hasura-auth.svg)](https://microbadger.com/images/rodolfosilva/hasura-auth 'Get your own version badge on microbadger.com')

## Setup

Create tables and initial state for your user management.

```sql
CREATE EXTENSION IF NOT EXISTS citext WITH SCHEMA public;

CREATE TABLE "role" (
  name text NOT NULL PRIMARY KEY,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

INSERT INTO "role" ("name") VALUES ('user');

CREATE TABLE "organization" (
  id uuid DEFAULT gen_random_uuid() NOT NULL CONSTRAINT organization_pkey PRIMARY KEY,
  name text NOT NULL,
  created_at timestamp WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at timestamp WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE TABLE "user" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NULL CONSTRAINT user_organization_id_fkey REFERENCES "organization" ON UPDATE CASCADE ON DELETE CASCADE,
  email citext NOT NULL,
  password text NOT NULL,
  default_role text NOT NULL DEFAULT 'user',
  is_active boolean NOT NULL DEFAULT false,
  secret_token uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT user_email_organization_id_key UNIQUE (email, organization_id),
  FOREIGN KEY (default_role) REFERENCES role (name)
);

CREATE TABLE "user_role" (
  id uuid DEFAULT gen_random_uuid() NOT NULL CONSTRAINT user_role_pkey PRIMARY KEY,
  user_id uuid NOT NULL CONSTRAINT user_role_user_id_fkey REFERENCES "user" ON UPDATE CASCADE ON DELETE CASCADE,
  role text NOT NULL,
  created_at timestamp WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at timestamp WITH TIME ZONE DEFAULT now() not null,
  CONSTRAINT user_role_user_id_role_key UNIQUE (user_id, role)
);

CREATE TABLE "user_session" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_agent text NULL,
  ip_address text NULL,
  user_id uuid NOT NULL,
  refresh_token text NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  FOREIGN KEY (user_id) REFERENCES "user" (id)
);
```

### Track your tables and relations in Hasura

Go to the Hasura console. Click the "Data" menu link and then click "Track all" under both "Untracked tables or views" and "Untracked foreign-key relations"

### Enable auth hook

Set your hasura environment to use this configuration:

```
HASURA_GRAPHQL_AUTH_HOOK=https://<your-domain-with-hasura-auth>/hook
```

[Read more...](https://docs.hasura.io/1.0/graphql/manual/auth/webhook.html)

### Use Remote Schema

Go to the Hasura console. Clink the "Remote Schemas" menu link and then click "Add".

Set a name to "Remote Schema name" like you prefer eg. (hasura-auth) and set the "GraphQL server URL" to use tbe url `https://<your-domain-with-hasura-auth>/graphql`/
In "Headers for the remote GraphQL server" select the option "Forward all headers from client". After that clink an "Add Remote Schema" button

## Environment

| name                            | default                                       | description                           |
| ------------------------------- | --------------------------------------------- | ------------------------------------- |
| `PORT`                          | `4000`                                        | Express server port                   |
| `HASURA_GRAPHQL_ENDPOINT`       | `http://graphql-engine:8080/v1alpha1/graphql` | Endpoit to hasura server              |
| `HASURA_GRAPHQL_ADMIN_SECRET`   | `NULL`                                        | Admin secrete key of hasura console   |
| `HASURA_GRAPHQL_CLAIMS_KEY`     | `https://hasura.io/jwt/claims`                | Key hequired by hasura in JWT         |
| `HASURA_GRAPHQL_HEADER_PREFIX`  | `x-hasura-`                                   | Hasura header prefix                  |
| `USER_REGISTRATION_AUTO_ACTIVE` | `true`                                        | Auto active the user account          |
| `REFRESH_TOKEN_EXPIRES_IN`      | `43200`                                       | Life time in minutes of refresh token |
| `JWT_ALGORITHM`                 | `HS256`                                       | JWT Algorithm                         |
| `JWT_PRIVATE_KEY`               | `secretkey`                                   | JWT Secret key used to generate token |
| `JWT_TOKEN_EXPIRES`             | `15`                                          | Life time in minutes of JWT           |
| `allowRegistrationFor`          | `*`                                           | Allow registration by role            |

## Todo

- [ ] Google Login
- [ ] Facebook Login
- [ ] Twitter Login

## License

MIT
