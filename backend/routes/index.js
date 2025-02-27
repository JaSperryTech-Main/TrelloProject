import { Router } from 'express';
import dataRoutes from './data.js';
import updateRoutes from './update.js';

const router = Router();

router.get('/', (req, res) => {
  res.send('Welcome to Express API');
});

router.use('/update', updateRoutes);

router.use('/data', dataRoutes);

export default router;
