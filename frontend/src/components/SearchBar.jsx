import { useNavigate } from 'react-router';
import { useState } from 'react';
import { TbSearch } from 'react-icons/tb';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const isValidID = (id) => {
    // CIP format: XX.XXXX (digits with decimal)
    // SOC format: XX-XXXX (digits with hyphen)
    const cipPattern = /^\d{2}\.\d{4}$/;
    const socPattern = /^\d{2}-\d{4}$/;
    return cipPattern.test(id) ? 'cip' : socPattern.test(id) ? 'soc' : null;
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const idType = isValidID(query);

    if (!idType) {
      setError('Invalid ID format. Use CIP (XX.XXXX) or SOC (XXXX) format');
      return;
    }

    setError('');
    navigate(`/job/${idType}/${query}`);
  };

  return (
    <div className="search-container">
      <form onSubmit={handleSearch} className="search-form">
        <div className="search-input-group">
          <TbSearch className="search-icon" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value.trim())}
            placeholder="Search CIP or SOC (e.g., 11.1023 or 151231)"
            aria-label="Search by CIP or SOC ID"
            className="search-input"
          />
          <button type="submit" className="search-button">
            Search
          </button>
        </div>
      </form>
      {error && <div className="search-error">{error}</div>}

      <style jsx>{`
        .search-container {
          flex: 1;
          max-width: 600px;
          position: relative;
        }

        .search-form {
          width: 100%;
        }

        .search-input-group {
          position: relative;
          display: flex;
          align-items: center;
          background-color: #f5f5f5;
          border-radius: 8px;
          transition: background-color 0.2s;
        }

        .search-input-group:hover {
          background-color: #eeeeee;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          color: #666;
          font-size: 1.2rem;
        }

        .search-input {
          width: 100%;
          border: none;
          background: transparent;
          padding: 0.8rem 1rem 0.8rem 2.5rem;
          font-size: 1rem;
          outline: none;
        }

        .search-button {
          background-color: #2563eb;
          color: white;
          border: none;
          padding: 0.6rem 1.2rem;
          margin: 0.25rem;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: background-color 0.2s;
          white-space: nowrap;
        }

        .search-button:hover {
          background-color: #1d4ed8;
        }

        .search-error {
          position: absolute;
          top: 100%;
          left: 0;
          color: #dc2626;
          font-size: 0.875rem;
          margin-top: 0.5rem;
        }

        @media (max-width: 768px) {
          .search-container {
            max-width: 100%;
          }

          .search-button {
            padding: 0.5rem 1rem;
            font-size: 0.875rem;
          }

          .search-input {
            padding-left: 2rem;
          }
        }
      `}</style>
    </div>
  );
};

export default SearchBar;
