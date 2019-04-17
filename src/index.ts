import { createApp } from './app';
import { port } from './vars';

const app = createApp();

app.listen({ port }, () =>
  console.log(`🚀 Server ready at http://localhost:${port}`),
);
