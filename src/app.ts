import express, { Application } from 'express';
import jwt from 'jsonwebtoken';
import { ApolloServer } from 'apollo-server-express';
import omitIn from 'lodash/omit';
import resolvers from './resolvers';
import { typeDefs } from './typeDefs';
import * as vars from './vars';

export const createApp = (): Application => {
  const app = express();
  app.disable('x-powered-by');

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    introspection: `${process.env.INTROSPECTION}` !== 'false',
    context: ({ res, req }) => ({ res, req }),
  });

  server.applyMiddleware({
    app,
    path: '/graphql',
  });

  app.get('/hook', (request, response) => {
    const unauthorizedResponseBody = {
      [`${vars.hasuraHeaderPrefix}role`]: 'anonymous',
    };

    try {
      const token = request.get('Authorization');
      let role = request.get('x-hasura-role');

      if (!token) {
        response.json(unauthorizedResponseBody);
        return;
      }

      const payload: any = jwt.verify(token.split(' ')[1], vars.jwtSecretKey);

      const claims = payload[vars.hasuraGraphqlClaimsKey];

      if (role === undefined) {
        role = claims['x-hasura-default-role'];
      }

      if (!claims['x-hasura-allowed-roles'].includes(role)) {
        response.sendStatus(401);
        return;
      }

      response.json({
        ...omitIn(claims, ['x-hasura-default-role', 'x-hasura-allowed-roles']),
        'x-hasura-role': role,
      });
    } catch (e) {
      response.sendStatus(401);
    }
  });

  return app;
};
