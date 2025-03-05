// getdata.js
import fs from 'fs';
import path from 'path';

// Function to load JSON data from a file
async function loadJSON(filepath) {
  try {
    const fullPath = path.resolve(filepath); // Resolve the full path for debugging
    if (!fs.existsSync(fullPath)) {
      throw new Error(`File does not exist: ${fullPath}`);
    }
    const data = await fs.promises.readFile(filepath, 'utf-8'); // Asynchronous read
    const jsonData = JSON.parse(data); // Parse JSON
    return jsonData;
  } catch (error) {
    console.error(`Error reading JSON file ${filepath}:`, error);
    return null;
  }
}

// Function to search for a SOC Code in all files
async function searchSOCCode(socCode) {
  // Load the CIP and SOC data
  const CIPData = await loadJSON('./output/pa_cip_soc.json');
  const paIdolData = await loadJSON('./output/pa_idol.json');
  const wdaHpoData = await loadJSON('./output/wda_hpo_lists.json');

  if (!CIPData || !paIdolData || !wdaHpoData) {
    console.warn('Failed to load one or more files.');
    return;
  }

  // Initialize the results object to hold the found data
  const results = {
    cip: null,
    paIdol: null,
    wdaHpo: null,
  };

  // Search in CIP data
  const cipMatch = CIPData['CIPxSOC 2015'].filter(
    (item) => item['SOC Code'] === socCode
  );
  if (cipMatch.length > 0) {
    results.cip = cipMatch;
  }

  // Search in PA Idol data
  let paIdolMatch = null;
  paIdolData.pages.forEach((page) => {
    page.tables.forEach((table) => {
      table.forEach((row) => {
        if (row['SOC\nCode'] == socCode) {
          paIdolMatch = row;
        }
      });
    });
  });
  if (paIdolMatch) {
    results.paIdol = paIdolMatch;
  }

  // Search in WDA HPO data
  const wdaHpoMatch = wdaHpoData.NW.find(
    (item) => item['SOC Code'] === socCode
  );
  if (wdaHpoMatch) {
    results.wdaHpo = wdaHpoMatch;
  }

  // Return the results containing data from the files that had a match
  return results;
}

async function searchCIPCode(cipCode) {
  // Load the CIP and SOC data
  const CIPData = await loadJSON('./output/pa_cip_soc.json');
  const paIdolData = await loadJSON('./output/pa_idol.json');
  const wdaHpoData = await loadJSON('./output/wda_hpo_lists.json');

  if (!CIPData || !paIdolData || !wdaHpoData) {
    console.warn('Failed to load one or more files.');
    return;
  }

  // Initialize the results object to hold the found data
  const results = {
    cip: [],
    paIdol: [],
    wdaHpo: [],
  };

  // Get the SOC codes associated with the CIP code
  const socGroup = CIPData['CIPxSOC 2015']
    .filter((item) => item['CIP Code'] === cipCode)
    .map((soc) => soc['SOC Code']);

  for (let i = 0; i < socGroup.length; i++) {
    const socCode = socGroup[i];

    // Search in CIP data
    const cipMatch = CIPData['CIPxSOC 2015'].filter(
      (item) => item['SOC Code'] === socCode
    );
    if (cipMatch.length > 0) {
      results.cip.push(...cipMatch);
    }

    // Search in PA Idol data
    let paIdolMatches = [];
    paIdolData.pages.forEach((page) => {
      page.tables.forEach((table) => {
        table.forEach((row) => {
          if (row['SOC\nCode'] == socCode) {
            paIdolMatches.push(row);
          }
        });
      });
    });
    if (paIdolMatches.length > 0) {
      results.paIdol.push(...paIdolMatches);
    }

    // Search in WDA HPO data
    const wdaHpoMatch = wdaHpoData.NW.find(
      (item) => item['SOC Code'] === socCode
    );
    if (wdaHpoMatch) {
      results.wdaHpo.push(wdaHpoMatch);
    }
  }

  return results;
}

async function getAllCIPCodes() {
  const CIPData = await loadJSON('./output/pa_cip_soc.json');

  if (!CIPData || !CIPData['CIPxSOC 2015']) {
    console.error('Invalid data structure');
    return;
  }

  // Create a Map to store unique CIP Codes with their respective titles
  const uniqueCIPCodesMap = new Map();

  // Iterate over the CIP data
  CIPData['CIPxSOC 2015'].forEach((item) => {
    const code = item['CIP Code'];
    const title = item['CIP Title'];

    // Only add the CIP code if it doesn't exist already in the Map
    if (!uniqueCIPCodesMap.has(code)) {
      uniqueCIPCodesMap.set(code, title);
    }
  });

  // Convert the Map to an array of objects with both code and title
  const allCIPCodes = Array.from(uniqueCIPCodesMap, ([code, title]) => ({
    code,
    title,
  }));

  return allCIPCodes;
}

async function getAllSOCCodes() {
  const CIPData = await loadJSON('./output/pa_cip_soc.json');

  if (!CIPData || !CIPData['CIPxSOC 2015']) {
    console.error('Invalid data structure');
    return;
  }

  // Create a Map to store unique SOC Codes with their respective titles
  const uniqueSOCCodesMap = new Map();

  // Iterate over the CIP data to extract SOC Codes and Titles
  CIPData['CIPxSOC 2015'].forEach((item) => {
    const code = item['SOC Code'];
    const title = item['SOC Title'];

    // Only add the SOC code if it doesn't exist already in the Map
    if (code && !uniqueSOCCodesMap.has(code)) {
      uniqueSOCCodesMap.set(code, title);
    }
  });

  // Convert the Map to an array of objects with both code and title
  const allSOCCodes = Array.from(uniqueSOCCodesMap, ([code, title]) => ({
    code,
    title,
  }));

  return allSOCCodes;
}

export { searchSOCCode, searchCIPCode, getAllCIPCodes, getAllSOCCodes };
