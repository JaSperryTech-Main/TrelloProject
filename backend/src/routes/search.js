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
const CACHE_TTL = 300000;

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
    targetArray = null,
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
              jsonData = { [targetArray]: jsonData[targetArray] };
            } else {
              return; // Skip if the specified array doesn't exist
            }
          }

          // Special handling for pa_idol.json - remove pages[i].text before searching
          if (file === 'pa_idol.json') {
            if (jsonData.pages && Array.isArray(jsonData.pages)) {
              jsonData.pages = jsonData.pages.map((page) => {
                const { text, ...rest } = page;
                return rest;
              });
            }
          }

          const matches = findMatchesInObject(jsonData, searchTerm, {
            fields,
            caseSensitive,
            file, // Pass file name for SOC/CIP identification
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

    // Deduplicate search results based on file + first match id
    const uniqueResultsMap = new Map();

    for (const result of searchResults) {
      const uniqueKey = `${result.file}-${result.matches[0]?.id || ''}`;

      if (!uniqueResultsMap.has(uniqueKey)) {
        // Deduplicate matches based on match id
        const seenIds = new Set();
        const uniqueMatches = result.matches.filter((match) => {
          if (!seenIds.has(match.id)) {
            seenIds.add(match.id);
            return true;
          }
          return false; // Skip if the match id is a duplicate
        });

        // Store result with deduplicated matches
        uniqueResultsMap.set(uniqueKey, {
          ...result,
          matches: uniqueMatches,
        });
      }
    }

    const uniqueResults = Array.from(uniqueResultsMap.values());

    // Sort and paginate
    uniqueResults.sort((a, b) => b.score - a.score);
    const paginatedResults = uniqueResults.slice(offset, offset + limit);

    return {
      results: paginatedResults,
      total: uniqueResults.length,
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
function findMatchesInObject(obj, searchTerm, options, path = '', root = obj) {
  const matches = [];
  const { fields, caseSensitive } = options;

  for (const [key, value] of Object.entries(obj)) {
    const currentPath = path ? `${path}.${key}` : key;

    if (fields.length > 0 && !fields.includes(currentPath)) {
      continue;
    }

    if (typeof value === 'object' && value !== null) {
      matches.push(
        ...findMatchesInObject(value, searchTerm, options, currentPath, root)
      );
    } else if (typeof value === 'string') {
      const textToSearch = caseSensitive ? value : value.toLowerCase();
      const comparisonTerm = caseSensitive
        ? searchTerm
        : searchTerm.toLowerCase();

      if (textToSearch.includes(comparisonTerm)) {
        let code = null;
        let type = null;

        if (currentPath.includes('SOC Title')) {
          type = 'SOC Code';
          const codePath = currentPath.replace('SOC Title', 'SOC Code');
          code = getValueFromPath(root, codePath);
        } else if (currentPath.includes('CIP Title')) {
          type = 'CIP Code';
          const codePath = currentPath.replace('CIP Title', 'CIP Code');
          code = getValueFromPath(root, codePath);
        }

        matches.push({
          id: code || null,
          type: type || 'Unknown',
          field: currentPath,
          value,
          positions: findMatchPositions(value, searchTerm, caseSensitive),
        });
      }
    } else if (typeof value === 'number' || typeof value === 'boolean') {
      const stringValue = String(value);
      const comparisonValue = caseSensitive
        ? stringValue
        : stringValue.toLowerCase();
      const comparisonTerm = caseSensitive
        ? searchTerm
        : searchTerm.toLowerCase();

      if (comparisonValue === comparisonTerm) {
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
 * Helper function to get a value from a nested object using dot notation path
 */
function getValueFromPath(obj, path) {
  return path.split('.').reduce((o, k) => (o || {})[k], obj);
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
      array: targetArray,
    } = req.query;

    if (!keyword) {
      return res.status(400).json({
        error: 'Search query parameter "q" is required',
        suggested_fix: 'Add ?q=your_search_term to your request URL',
      });
    }

    // Validate page and per_page
    const pageNum = parseInt(page);
    const perPageNum = parseInt(per_page);
    if (isNaN(pageNum) || isNaN(perPageNum) || pageNum < 1 || perPageNum < 1) {
      return res.status(400).json({
        error: 'Invalid pagination parameters',
        details: 'page and per_page must be positive integers',
      });
    }

    const cacheKey = JSON.stringify({
      keyword,
      fields,
      case_sensitive,
      page,
      per_page,
      targetArray,
    });

    // Cache handling
    if (cache === 'true') {
      const cached = searchCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return res.json(cached.data);
      }
    }

    const fieldsArray = fields ? fields.split(',') : [];

    const results = await searchJSONFiles(OUTPUT_DIR, {
      keyword,
      fields: fieldsArray,
      caseSensitive: case_sensitive === 'true',
      limit: perPageNum,
      offset: (pageNum - 1) * perPageNum,
      targetArray,
    });

    const response = {
      query: keyword,
      results: results.results,
      pagination: {
        total: results.total,
        page: pageNum,
        per_page: perPageNum,
        total_pages: Math.ceil(results.total / perPageNum),
      },
      meta: {
        fields_searched: fieldsArray.length > 0 ? fieldsArray : 'all',
        case_sensitive: case_sensitive === 'true',
        ...(targetArray && { searched_array: targetArray }),
      },
    };

    if (cache === 'true') {
      searchCache.set(cacheKey, {
        data: response,
        timestamp: Date.now(),
      });
    }

    res.json(response);
  } catch (error) {
    console.error('Search API error:', error);
    res.status(500).json({
      error: 'An error occurred while processing your search',
      details:
        process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

export default router;
