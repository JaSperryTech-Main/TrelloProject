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
    console.log('Failed to load one or more files.');
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

// Function to display the results in a readable format
// For Debugging
function displayResults(socCode, results) {
  console.log(`Results for SOC Code: ${socCode}`);

  if (results.cip) {
    console.log('\nCIP and Related SOCs:');
    console.log(results.cip);
  } else {
    console.log('\nNo match found in CIP and Related SOCs.');
  }

  if (results.paIdol) {
    console.log('\nPA Idol Data:');
    console.log(results.paIdol);
  } else {
    console.log('\nNo match found in PA Idol.');
  }

  if (results.wdaHpo) {
    console.log('\nWDA HPO Data:');
    console.log(results.wdaHpo);
  } else {
    console.log('\nNo match found in WDA HPO lists.');
  }
}

async function getAllCIPCodes() {
  const CIPData = await loadJSON('./output/pa_cip_soc.json');

  if (!CIPData || !CIPData['CIPxSOC 2015']) {
    console.error('Invalid data structure');
    return;
  }

  const allCIPCodes = [
    ...new Set(CIPData['CIPxSOC 2015'].map((item) => item['CIP Code'])),
  ];
}

// Example usage: search for a specific SOC code (e.g., "25-2022" works on all jsons)
// searchAndDisplaySOCCode('25-2022'); // Change this to the SOC Code you want to search
export { searchSOCCode, getAllCIPCodes };
