# Hasura Auth [WIP]

Inspired by the [hasura-backend-plus](https://github.com/elitan/hasura-backend-plus)

## Setup

Create tables and initial state for your user management.
```sql      
CREATE EXTENSION IF NOT EXISTS citext WITH SCHEMA public;
CREATE TABLE "user" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email citext NOT NULL UNIQUE,
  password text NOT NULL,
  role text NOT NULL DEFAULT 'user',
  is_active boolean NOT NULL DEFAULT false,
  secret_token uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
); 

CREATE TABLE "user_session" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_agent text NULL,
  ip_address text NULL,
  user_id uuid NOT NULL,
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
|---------------------------------|-----------------------------------------------|---------------------------------------|
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

## Todo

* [ ] Google Login
* [ ] Facebook Login
* [ ] Twitter Login

## License

MIT
