import '../styles/Header.css';
import { TbSearch } from 'react-icons/tb';

const Header = () => {
  const handleUpdateClick = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/update', {
        method: 'GET', // or "GET" if you are fetching data
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      console.log('Success:', data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <nav id="mainHeader">
      <img src="" alt="Icon" id="headerIcon" className="Icon" />
      <div id="searchBar">
        <TbSearch />
        <input id="seachInput" />
      </div>
      <button onClick={handleUpdateClick}>Update</button>
    </nav>
  );
};

export default Header;
