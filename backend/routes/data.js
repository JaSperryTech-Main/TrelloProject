import { Router } from 'express';
import searchAndDisplaySOCCode from '../script/GetData.js'; // Ensure correct casing

const router = Router();

// Route to fetch SOC data for a hardcoded SOC code (for testing)
router.get('/soc', async (req, res) => {
  try {
    const data = await searchAndDisplaySOCCode('25-2022'); // Default example
    res.json({ data });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve data' });
  }
});

// Route to fetch SOC data dynamically based on the ID parameter
router.get('/soc/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const data = await searchAndDisplaySOCCode(id);
    res.json({ data });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve data' });
  }
});

export default router;
