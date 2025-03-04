import '../styles/Header.css';
import { TbSearch } from 'react-icons/tb';

const Header = () => {
  return (
    <nav>
      <img src="" alt="Icon" id="headerIcon" className="Icon" />
      <div id="searchBar">
        <TbSearch />
        <input id="seachInput"></input>
      </div>
    </nav>
  );
};

export default Header;
