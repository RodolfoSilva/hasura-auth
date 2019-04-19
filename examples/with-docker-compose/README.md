# Hasura Auth + Hasura Engine + Caddy

## Images

* [Postgres - latest](https://hub.docker.com/_/postgres)
* [Hasura GraphQL Engine - v1.0.0-alpha44.cli-migrations](https://hub.docker.com/r/hasura/graphql-engine)
* [Hasura Auth - 0.0.4](https://hub.docker.com/r/rodolfosilva/hasura-auth)
* [Caddy - 0.11.0](https://hub.docker.com/r/abiosoft/caddy)

## Run

```bash
$ docker-compose up --build
```

### Note

In the docker-compose.yml you need change the `HASURA_GRAPHQL_ADMIN_SECRET` with a strong and secret password.

## License

MIT
