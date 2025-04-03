import { Router } from 'express';
import dataRoutes from './data.js';
import updateRoutes from './update.js';
import searchRoutes from './search.js';

import { fileURLToPath } from 'url';
import fs from 'fs';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

router.get('/', (req, res) => {
  res.send('Welcome to Express API');
});

router.use('/data', dataRoutes);

router.use('/update', updateRoutes);

router.use('/search', searchRoutes);

router.get('/arrays', (req, res) => {
  try {
    // Resolve the absolute path to the JSON file
    const filePath = path.join(__dirname, '../../output/wda_hpo_lists.json');

    // Read the file synchronously (use async version in production)
    const rawData = fs.readFileSync(filePath);
    const jsonData = JSON.parse(rawData);

    // Extract all array names (top-level keys in the JSON)
    const arrays = Object.keys(jsonData);

    // Send the response
    res.json({
      success: true,
      arrays: arrays,
    });
  } catch (error) {
    console.error('Error fetching arrays:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available arrays',
      error: error.message,
    });
  }
});

export default router;
