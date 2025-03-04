import { Router } from 'express';
import { searchSOCCode, getAllCIPCodes } from '../utils/GetData.js';

const router = Router();

router.get('/soc/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const data = await searchSOCCode(id);
    res.json({ data });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve data' });
  }
});

router.get('/cip/all', async (req, res) => {
  try {
    const data = await getAllCIPCodes();
    res.json({ data });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve data' });
  }
});

export default router;
