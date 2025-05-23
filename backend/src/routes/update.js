import { Router } from 'express';
import convertExcel from '../utils/convertExcel.js';
import { spawn } from 'child_process';

const router = Router();

const links = [
  'https://www.pa.gov/content/dam/copapwp-pagov/en/dli/documents/cwia/products/hpos/wda%20hpo%20lists.xlsx',
  'https://www.pa.gov/content/dam/copapwp-pagov/en/dli/documents/cwia/products/hpos/pa_cip_soc.xls',
];

router.get('/', async (req, res) => {
  try {
    await convertExcel(links[0], '', 'vertical');
    await convertExcel(links[1], 'CIPxSOC 2015', 'horizontal');
    const convertPDF = spawn('python', ['./src/script/convertPDF.py']);

    convertPDF.stderr.on('data', (data) => {
      console.error(`Error: ${data}`);
    });

    convertPDF.on('close', (code) => {
      console.error(`Python script exited with code ${code}`);
    });

    res.status(200).json({ message: 'Excel files processed successfully' });
  } catch (error) {
    console.error('Error converting Excel file:', error);
    res.status(500).json({ error: 'Failed to process Excel file' });
  }
});

export default router;
