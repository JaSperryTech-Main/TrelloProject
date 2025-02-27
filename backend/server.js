import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import routes from './routes/index.js';

dotenv.config();

const app = express();

const corsConfig = {};

app.use(express.json());
app.use(cors(corsConfig));

app.use('/api', routes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log('Server Listening on http://localhost:3000');
});
