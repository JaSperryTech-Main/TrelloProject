// convertExcel.js
import fs from 'fs';
import xlsx from 'xlsx';
import path from 'path';
import axios from 'axios';
import https from 'https';

// Download a file from a URL and save it to the local file system
const downloadFile = async (url, downloadPath) => {
  const writer = fs.createWriteStream(downloadPath);

  const agent = new https.Agent({
    rejectUnauthorized: false, // Disable SSL verification for simplicity
  });

  const response = await axios.get(url, {
    responseType: 'stream',
    httpsAgent: agent,
  });

  return new Promise((resolve, reject) => {
    response.data.pipe(writer);
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
};

// Convert Excel file to JSON (unchanged)
const convertExcelToJson = (filepath, allowedSheets = [], headerType) => {
  const workbook = xlsx.readFile(filepath);
  let jsonData = {};

  workbook.SheetNames.forEach((sheet) => {
    if (allowedSheets.length === 0 || allowedSheets.includes(sheet)) {
      const worksheet = workbook.Sheets[sheet];

      if (headerType === 'vertical') {
        // Process with vertical headers
        let sheetData = xlsx.utils.sheet_to_json(worksheet, { header: 1 }); // Get all rows as an array

        if (sheetData && sheetData.length >= 4) {
          const headers = sheetData[3]; // Row 4 as headers (index 3 because it's 0-based)
          jsonData[sheet] = sheetData.slice(4).map((row) => {
            return headers.reduce((acc, key, i) => {
              acc[key] = row[i] || '';
              return acc;
            }, {});
          });
        } else {
          jsonData[sheet] = []; // If there aren’t enough rows, return an empty array
        }
      } else if (headerType === 'horizontal') {
        // Process with horizontal headers
        jsonData[sheet] = xlsx.utils.sheet_to_json(worksheet);
      } else {
        throw new Error(
          'Unsupported header type. Please use "vertical" or "horizontal".'
        );
      }
    }
  });

  return jsonData;
};

// Main function to convert a file (Excel or PDF) to JSON
const convertFileToJson = async (filepath, allowedSheets, headerType) => {
  const ext = filepath.split('.').pop().toLowerCase();

  try {
    let jsonData;

    if (ext === 'xls' || ext === 'xlsx') {
      jsonData = convertExcelToJson(filepath, allowedSheets, headerType);
    } else {
      throw new Error('Unsupported file type');
    }

    const outputDir = path.join('output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputFileName =
      path.basename(filepath, path.extname(filepath)) + '.json';
    const outputFilePath = path.join(outputDir, outputFileName);

    fs.writeFileSync(outputFilePath, JSON.stringify(jsonData, null, 2));

    return jsonData;
  } catch (error) {
    console.error('Error converting file:', error);
  }
};

// Main function to handle URL download and file conversion
const processFileFromUrl = async (fileUrl, allowedSheets, headerType) => {
  const fileName = path.basename(fileUrl).replace(/%20/g, '_');
  const outputDir = path.join('output');
  const outputFileName =
    path.basename(fileName, path.extname(fileName)) + '.json';
  const outputFilePath = path.join(outputDir, outputFileName);

  // Check if cached JSON exists
  if (fs.existsSync(outputFilePath)) {
    try {
      const cachedData = fs.readFileSync(outputFilePath, 'utf8');
      return JSON.parse(cachedData);
    } catch (error) {
      console.error('Error reading cached file:', error);
      // Proceed to download if cache read fails
    }
  }

  // Proceed to download and convert
  const tempDir = path.join('temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const localFilePath = path.join(tempDir, fileName);

  try {
    await downloadFile(fileUrl, localFilePath);
    const jsonData = await convertFileToJson(
      localFilePath,
      allowedSheets,
      headerType
    );
    fs.unlinkSync(localFilePath); // Cleanup temp file
    return jsonData;
  } catch (error) {
    console.error('Error processing file from URL:', error);
    throw error; // Let the caller handle the error
  }
};

export default processFileFromUrl;
