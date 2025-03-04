const SearchTemplate = () => {
  return (
    <main>
      <nav>
        <label for="search-sort">Sort: </label>
        <select name="sort" id="search-sort">
          <option value=""></option>
        </select>
      </nav>
      <h1>Output</h1>
      <div>
        <p>Job Name - Soc Code</p>
      </div>
    </main>
  );
};

export default SearchTemplate;
