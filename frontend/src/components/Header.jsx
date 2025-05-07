import { TbSearch } from 'react-icons/tb';
import { useState } from 'react';
import { Link } from 'react-router';
import SearchBar from './SearchBar.jsx';

const Header = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState(null);

  const handleUpdateClick = async () => {
    setIsUpdating(true);
    setUpdateError(null);

    try {
      const response = await fetch('http://localhost:3000/api/update', {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
    } catch (error) {
      console.error('Error:', error);
      setUpdateError('Failed to update. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <header id="mainHeader">
      <Link to="/">
        <img
          src="templateLogo.png"
          alt="Site Logo"
          id="headerIcon"
          className="icon"
        />
      </Link>

      <div id="searchBar" className="searchBar">
        <TbSearch className="searchIcon" />
        <SearchBar />
      </div>
      <button
        onClick={handleUpdateClick}
        disabled={isUpdating}
        className="updateButton"
      >
        {isUpdating ? 'Updating...' : 'Update'}
      </button>
      {updateError && <div className="error">{updateError}</div>}

      <Link to="/job/soc">
        <button>SOCs</button>
      </Link>

      <Link to="/job/cip">
        <button>CIPs</button>
      </Link>

      <style jsx>{`
        #mainHeader {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          padding: 1rem 2rem;
          background-color: #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          position: relative;
        }

        #headerIcon {
          height: 40px;
          width: auto;
        }

        .searchBar {
          flex: 1;
          max-width: 600px;
          position: relative;
          background-color: #f5f5f5;
          border-radius: 8px;
          padding: 0.5rem 1rem;
          transition: background-color 0.2s;
        }

        .searchBar:hover {
          background-color: #eeeeee;
        }

        .searchIcon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #666;
          font-size: 1.2rem;
        }

        #searchInput {
          width: 100%;
          border: none;
          background: transparent;
          padding-left: 2rem;
          font-size: 1rem;
          outline: none;
        }

        button {
          background-color: #2563eb;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
          white-space: nowrap;
        }

        button:hover:not(:disabled) {
          background-color: #1d4ed8;
        }

        button:disabled {
          background-color: #93c5fd;
          cursor: not-allowed;
        }

        .error {
          position: absolute;
          bottom: -1.5rem;
          right: 2rem;
          color: #dc2626;
          font-size: 0.875rem;
        }

        @media (max-width: 768px) {
          #mainHeader {
            padding: 1rem;
            gap: 1rem;
          }

          #headerIcon {
            height: 32px;
          }

          .searchBar {
            padding: 0.5rem;
          }

          .updateButton {
            padding: 0.5rem 1rem;
            font-size: 0.875rem;
          }
        }
      `}</style>
    </header>
  );
};

export default Header;
