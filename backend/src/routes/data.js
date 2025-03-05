import { Router } from 'express';
import {
  searchSOCCode,
  searchCIPCode,
  getAllCIPCodes,
  getAllSOCCodes,
} from '../utils/GetData.js';

const router = Router();

router.get('/cip/all', async (req, res) => {
  try {
    const data = await getAllCIPCodes();
    res.json({ data });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve data' });
  }
});

router.get('/soc/all', async (req, res) => {
  try {
    const data = await getAllSOCCodes();
    console.log(data);
    res.json({ data });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve data' });
  }
});

router.get('/soc/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const data = await searchSOCCode(id);
    res.json({ data });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve data' });
  }
});

router.get('/cip/:id', async (req, res) => {
  const { id } = req.params;
  console.log(id);
  try {
    const data = await searchCIPCode(id);
    res.json({ data });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve data' });
  }
});

export default router;
