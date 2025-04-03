import { Router } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const router = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUTPUT_DIR = path.join(__dirname, '../../output');

// Cache for storing search results (optional optimization)
const searchCache = new Map();

/**
 * Enhanced search function with field-specific searching and pagination
 */
async function searchJSONFiles(directory, options = {}) {
  const {
    keyword,
    fields = [],
    caseSensitive = false,
    limit = 10,
    offset = 0,
    minScore = 0.5,
    targetArray = null, // New parameter to specify which array to search
  } = options;

  try {
    const files = await fs.readdir(directory);
    const jsonFiles = files.filter((file) => file.endsWith('.json'));

    if (jsonFiles.length === 0) {
      return { results: [], total: 0 };
    }

    const searchResults = [];
    const searchTerm = caseSensitive ? keyword : keyword.toLowerCase();

    await Promise.all(
      jsonFiles.map(async (file) => {
        try {
          const filePath = path.join(directory, file);
          const fileContent = await fs.readFile(filePath, 'utf8');
          let jsonData = JSON.parse(fileContent);

          // Special handling for wda_hpo_lists.json
          if (file === 'wda_hpo_lists.json' && targetArray) {
            if (jsonData[targetArray]) {
              // Only search within the specified array
              jsonData = { [targetArray]: jsonData[targetArray] };
            } else {
              return; // Skip if the specified array doesn't exist
            }
          }

          const matches = findMatchesInObject(jsonData, searchTerm, {
            fields,
            caseSensitive,
          });

          if (matches.length > 0) {
            const score = calculateMatchScore(matches, searchTerm);
            if (score >= minScore) {
              searchResults.push({
                file,
                matches,
                score,
                snippet: generateSnippet(matches, searchTerm),
                ...(file === 'wda_hpo_lists.json' && {
                  searchedArray: targetArray,
                }),
              });
            }
          }
        } catch (error) {
          console.error(`Error processing file ${file}:`, error);
        }
      })
    );

    searchResults.sort((a, b) => b.score - a.score);
    const paginatedResults = searchResults.slice(offset, offset + limit);

    return {
      results: paginatedResults,
      total: searchResults.length,
      limit,
      offset,
    };
  } catch (error) {
    console.error('Search error:', error);
    throw error;
  }
}

/**
 * Recursively search for matches in an object
 */
function findMatchesInObject(obj, searchTerm, options, path = '') {
  const matches = [];
  const { fields, caseSensitive } = options;

  for (const [key, value] of Object.entries(obj)) {
    const currentPath = path ? `${path}.${key}` : key;

    // Skip if specific fields are requested and this isn't one of them
    if (fields.length > 0 && !fields.includes(currentPath)) {
      continue;
    }

    if (typeof value === 'object' && value !== null) {
      // Recursively search nested objects
      matches.push(
        ...findMatchesInObject(value, searchTerm, options, currentPath)
      );
    } else if (typeof value === 'string') {
      const textToSearch = caseSensitive ? value : value.toLowerCase();
      if (textToSearch.includes(searchTerm)) {
        matches.push({
          field: currentPath,
          value,
          // Add position information for highlighting
          positions: findMatchPositions(value, searchTerm, caseSensitive),
        });
      }
    } else if (typeof value === 'number' || typeof value === 'boolean') {
      const stringValue = String(value);
      if (
        (caseSensitive ? stringValue : stringValue.toLowerCase()) === searchTerm
      ) {
        matches.push({
          field: currentPath,
          value: stringValue,
        });
      }
    }
  }

  return matches;
}

/**
 * Find positions of matches in a string for highlighting
 */
function findMatchPositions(text, searchTerm, caseSensitive) {
  const positions = [];
  let searchStr = caseSensitive ? text : text.toLowerCase();
  const term = caseSensitive ? searchTerm : searchTerm.toLowerCase();
  let index = searchStr.indexOf(term);

  while (index !== -1) {
    positions.push({ start: index, end: index + term.length });
    index = searchStr.indexOf(term, index + 1);
  }

  return positions;
}

/**
 * Calculate a simple relevance score
 */
function calculateMatchScore(matches, searchTerm) {
  // Basic scoring - more matches and longer matches score higher
  let score = 0;
  for (const match of matches) {
    if (match.positions) {
      score += match.positions.length * (searchTerm.length / 10);
    }
  }
  return Math.min(score, 1); // Normalize to 0-1 range
}

/**
 * Generate a text snippet with matched terms
 */
function generateSnippet(matches, searchTerm) {
  // Take the first few matches and create a preview
  const previewMatches = matches.slice(0, 3);
  const snippets = previewMatches.map((match) => {
    let value = match.value;
    if (typeof value === 'string' && value.length > 100) {
      value = value.substring(0, 100) + '...';
    }
    return `${match.field}: ${value}`;
  });
  return snippets.join(' | ');
}

/**
 * Search endpoint with enhanced features
 */
router.get('/', async (req, res) => {
  try {
    const {
      q: keyword,
      fields,
      case_sensitive,
      page = 1,
      per_page = 10,
      cache = 'true',
      array: targetArray, // New parameter to specify which array to search in wda_hpo_lists.json
    } = req.query;

    if (!keyword) {
      return res.status(400).json({
        error: 'Search query parameter "q" is required',
      });
    }

    const cacheKey = JSON.stringify({
      keyword,
      fields,
      case_sensitive,
      page,
      per_page,
      targetArray, // Include in cache key
    });

    if (cache === 'true' && searchCache.has(cacheKey)) {
      return res.json(searchCache.get(cacheKey));
    }

    const fieldsArray = fields ? fields.split(',') : [];

    const results = await searchJSONFiles(OUTPUT_DIR, {
      keyword,
      fields: fieldsArray,
      caseSensitive: case_sensitive === 'true',
      limit: parseInt(per_page),
      offset: (parseInt(page) - 1) * parseInt(per_page),
      targetArray, // Pass to search function
    });

    const response = {
      query: keyword,
      results: results.results,
      pagination: {
        total: results.total,
        page: parseInt(page),
        per_page: parseInt(per_page),
        total_pages: Math.ceil(results.total / parseInt(per_page)),
      },
      meta: {
        fields_searched: fieldsArray.length > 0 ? fieldsArray : 'all',
        case_sensitive: case_sensitive === 'true',
        ...(targetArray && { searched_array: targetArray }),
      },
    };

    if (cache === 'true') {
      searchCache.set(cacheKey, response);
      setTimeout(() => {
        searchCache.delete(cacheKey);
      }, 300000);
    }

    res.json(response);
  } catch (error) {
    console.error('Search API error:', error);
    res.status(500).json({
      error: 'An error occurred while processing your search',
      details: error.message,
    });
  }
});

export default router;
