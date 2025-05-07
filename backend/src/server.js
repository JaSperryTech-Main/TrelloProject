import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import routes from './routes/index.js';

const coreConfig = {
  origin: '*',
};

dotenv.config();

const app = express();

app.use(cors(coreConfig));

app.use(express.json());

app.use('/api', routes);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server Listening on http://localhost:${process.env.PORT}`);
});
