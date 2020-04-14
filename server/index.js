import express     from 'express';
import GraphqlServer from './data/schema';
import cors from 'cors';

const app = express();

require('./db')

app.get('/', (req, res) => {
  res.send('app is working')
});



app.use('*', cors({ origin: 'http://localhost:3000'}));


GraphqlServer.applyMiddleware({
  app: app
});

app.listen(4000, () => {
  console.log('server is running on port 4000')
  console.log('graphql server is running on localhost:4000/graphql, check schema file')
});

