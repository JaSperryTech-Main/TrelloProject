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

router.get('/files/:id', (req, res) => {
  const { id } = req.params; // Extract 'id' from URL params

  try {
    // Build the file path using the id (ensure the file exists in the given folder)
    const filePath = path.join(__dirname, `../../output/${id}.json`);

    // Read the file synchronously (for simplicity, use async version in production)
    const rawData = fs.readFileSync(filePath, 'utf8');
    const jsonData = JSON.parse(rawData); // Parse the file content as JSON

    // Send the JSON data back to the client
    res.json(jsonData);
  } catch (error) {
    // Handle errors (e.g., file not found or JSON parsing error)
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve or parse the file.' });
  }
});

export default router;
