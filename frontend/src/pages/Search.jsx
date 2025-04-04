import { useState, useEffect, useRef } from 'react';
import {
  TbSearch,
  TbX,
  TbClock,
  TbAlertCircle,
  TbExternalLink,
  TbSettings,
  TbChevronDown,
  TbChevronUp,
} from 'react-icons/tb';
import { Link, useNavigate } from 'react-router';

const Search = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [showRecent, setShowRecent] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [searchSettings, setSearchSettings] = useState({
    caseSensitive: false,
    targetArray: '',
    fields: [],
    perPage: 5,
  });
  const [availableArrays, setAvailableArrays] = useState([]);
  const debounceTimer = useRef(null);
  const searchInputRef = useRef(null);

  const fetchAvailableArrays = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/arrays');
      if (!response.ok) {
        throw new Error('Failed to fetch available arrays');
      }
      const data = await response.json();
      setAvailableArrays(data.arrays || []);
    } catch (err) {
      console.error('Error fetching arrays:', err);
      setAvailableArrays([]);
    }
  };

  useEffect(() => {
    const savedSearches = localStorage.getItem('recentSearches');
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }
    fetchAvailableArrays();
  }, []);

  useEffect(() => {
    if (query.trim() === '') {
      setResults([]);
      return;
    }

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      performSearch(query);
    }, 500);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [query, searchSettings]);

  const performSearch = async (searchTerm) => {
    if (!searchTerm.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      const params = new URLSearchParams({
        q: searchTerm,
        page: 1,
        per_page: searchSettings.perPage,
        case_sensitive: searchSettings.caseSensitive ? 'true' : 'false',
        ...(searchSettings.targetArray && {
          array: searchSettings.targetArray,
        }),
        ...(searchSettings.fields.length > 0 && {
          fields: searchSettings.fields.join(','),
        }),
      });

      const response = await fetch(
        `http://localhost:3000/api/search?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error('Search failed. Please try again.');
      }

      const data = await response.json();

      if (data.results.length === 0) {
        setError(
          'No results found. Try a different search term or adjust your settings.'
        );
      } else {
        // Process results to extract SOC/CIP codes when titles match
        const processedResults = data.results.map((result) => {
          // Find SOC/CIP code matches
          const socMatch = result.matches.find(
            (match) =>
              match.field.toLowerCase().includes('soc code') ||
              match.field.toLowerCase().endsWith('soc')
          );

          const cipMatch = result.matches.find(
            (match) =>
              match.field.toLowerCase().includes('cip code') ||
              match.field.toLowerCase().endsWith('cip')
          );

          // Find title matches
          const titleMatch = result.matches.find(
            (match) =>
              match.field.toLowerCase().includes('title') &&
              !match.field.toLowerCase().includes('code')
          );

          return {
            ...result,
            socCode: socMatch?.value,
            cipCode: cipMatch?.value,
            titleMatch: titleMatch,
          };
        });

        setResults(processedResults);
        addToRecentSearches(searchTerm);
      }
    } catch (err) {
      setError(err.message);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const addToRecentSearches = (searchTerm) => {
    const updatedRecent = [
      searchTerm,
      ...recentSearches.filter((item) => item !== searchTerm),
    ].slice(0, 5);

    setRecentSearches(updatedRecent);
    localStorage.setItem('recentSearches', JSON.stringify(updatedRecent));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      performSearch(query);
      searchInputRef.current?.blur();
    }
  };

  const handleCodeClick = (e, value, type) => {
    e.stopPropagation();
    navigate(`/job/${type}/${value}`);
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setError('');
    searchInputRef.current?.focus();
  };

  const handleRecentSearchClick = (recentQuery) => {
    setQuery(recentQuery);
    setShowRecent(false);
  };

  const getResultLink = (result) => {
    return `/details/${result.file.replace('.json', '')}`;
  };

  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };

  const handleSettingChange = (setting, value) => {
    setSearchSettings((prev) => ({
      ...prev,
      [setting]: value,
    }));
  };

  const formatFieldName = (field) => {
    const parts = field.split('.');
    let lastPart = parts[parts.length - 1];

    if (lastPart === 'SOC Code') return 'SOC';
    if (lastPart === 'CIP Code') return 'CIP';
    if (lastPart === 'SOC Title') return 'SOC Title';
    if (lastPart === 'CIP Title') return 'CIP Title';

    return lastPart;
  };

  const highlightMatch = (text, positions) => {
    if (!positions || positions.length === 0) return text;

    let result = [];
    let lastIndex = 0;

    positions.forEach((pos) => {
      if (pos.start > lastIndex) {
        result.push(text.substring(lastIndex, pos.start));
      }
      result.push(
        <span className="bg-yellow-200 font-semibold">
          {text.substring(pos.start, pos.end)}
        </span>
      );
      lastIndex = pos.end;
    });

    if (lastIndex < text.length) {
      result.push(text.substring(lastIndex));
    }

    return result;
  };

  return (
    <div className="max-w-2xl mx-auto p-4 relative">
      <form onSubmit={handleSearch} className="w-full">
        <div className="relative flex items-center">
          <div className="absolute left-3 text-gray-500">
            <TbSearch className="w-5 h-5" />
          </div>
          <input
            ref={searchInputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowRecent(true)}
            onBlur={() => setTimeout(() => setShowRecent(false), 200)}
            placeholder="Search by SOC/CIP code or title (e.g., 'Computer Support' or '15-1252')"
            aria-label="Search by SOC/CIP code or title"
            className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              error
                ? 'border-red-500 focus:ring-red-200'
                : 'border-gray-300 focus:ring-blue-200'
            }`}
          />
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-12 text-gray-500 hover:text-gray-700"
              aria-label="Clear search"
            >
              <TbX className="w-5 h-5" />
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className={`ml-2 px-4 py-2 rounded-lg ${
              isLoading || !query.trim()
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            Search
          </button>
        </div>
      </form>

      <button
        onClick={toggleSettings}
        className="mt-2 flex items-center text-sm text-gray-600 hover:text-gray-900"
      >
        <TbSettings className="w-4 h-4 mr-1" />
        Search Settings
        {showSettings ? (
          <TbChevronUp className="w-4 h-4 ml-1" />
        ) : (
          <TbChevronDown className="w-4 h-4 ml-1" />
        )}
      </button>

      {showSettings && (
        <div className="mt-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="space-y-4">
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={searchSettings.caseSensitive}
                  onChange={(e) =>
                    handleSettingChange('caseSensitive', e.target.checked)
                  }
                  className="rounded text-blue-600"
                />
                <span>Case sensitive search</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search in specific array (wda_hpo_lists.json only)
              </label>
              <select
                value={searchSettings.targetArray}
                onChange={(e) =>
                  handleSettingChange('targetArray', e.target.value)
                }
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">All arrays</option>
                {availableArrays.map((array) => (
                  <option key={array} value={array}>
                    {array}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-2 flex items-center text-red-600">
          <TbAlertCircle className="w-5 h-5 mr-2" />
          <span>{error}</span>
        </div>
      )}

      {showRecent && recentSearches.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
          <div className="px-4 py-2 text-sm text-gray-500 border-b border-gray-200 flex items-center">
            <TbClock className="w-4 h-4 mr-2" />
            Recent Searches
          </div>
          {recentSearches.map((recentQuery, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleRecentSearchClick(recentQuery)}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
            >
              {recentQuery}
            </button>
          ))}
        </div>
      )}

      {results.length > 0 && (
        <div className="mt-4 space-y-3">
          {results.map((result, index) => (
            <a
              key={index}
              className="block p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow hover:border-blue-500 group"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-900 group-hover:text-blue-600">
                    {result.file.replace('.json', '')}
                  </h3>

                  {/* Display title if available */}
                  {result.titleMatch && (
                    <p className="text-sm text-gray-600 mt-1">
                      {highlightMatch(
                        result.titleMatch.value,
                        result.titleMatch.positions
                      )}
                    </p>
                  )}

                  {result.searchedArray && (
                    <span className="text-xs text-gray-500">
                      Array: {result.searchedArray}
                    </span>
                  )}
                </div>
                <Link to={getResultLink(result)}>
                  <TbExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
                </Link>
              </div>

              <div className="mt-2 flex flex-wrap gap-1">
                {result.matches.map((match, i) => {
                  const isSoc = match.field.toLowerCase().includes('soc');
                  const isCip = match.field.toLowerCase().includes('cip');
                  const fieldName = formatFieldName(match.field);

                  if (isSoc || isCip) {
                    return (
                      <span
                        key={i}
                        onClick={(e) =>
                          handleCodeClick(e, match.value, isSoc ? 'soc' : 'cip')
                        }
                        className={`px-2 py-1 text-xs rounded cursor-pointer ${
                          isSoc
                            ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                        }`}
                      >
                        {fieldName}: {match.value}
                      </span>
                    );
                  }
                })}
              </div>
            </a>
          ))}
        </div>
      )}

      {isLoading && (
        <div className="mt-4 flex items-center text-gray-500">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400 mr-2"></div>
          <span>Searching...</span>
        </div>
      )}
    </div>
  );
};

export default Search;
