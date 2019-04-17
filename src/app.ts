import express, { Application } from 'express';
import jwt from 'jsonwebtoken';
import { ApolloServer } from 'apollo-server-express';
import resolvers from './resolvers';
import { typeDefs } from './typeDefs';
import * as vars from './vars';

export const createApp = (): Application => {
  const app = express();
  app.disable('x-powered-by');

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ res, req }) => ({ res, req }),
  });

  server.applyMiddleware({
    app,
    path: '/graphql',
  });

  app.get('/hook', (request, response) => {
    const token = request.get('Authorization');

    if (!token) {
      response.json({ [`${vars.hasuraHeaderPrefix}role`]: 'anonymous' });
      return;
    }

    const payload: any = jwt.verify(token.split(' ')[1], vars.jwtSecretKey);

    response.json(payload[vars.hasuraGraphqlClaimsKey]);
  });

  return app;
};
