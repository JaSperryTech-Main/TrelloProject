import Job from './layout/Job.jsx';
import Home from './pages/Home';
import JobTemplate from './pages/Job.jsx';
import Search from './layout/Search.jsx';
import { Routes, Route } from 'react-router';
import SearchTemplate from './pages/Search.jsx';

const App = () => {
  return (
    <Routes>
      <Route index element={<Home />} />

      <Route path="search">
        <Route index element={<SearchTemplate />} />
        <Route path=":id" element={<Search />} />
      </Route>

      <Route path="job">
        <Route index element={<JobTemplate />} />
        <Route path=":id" element={<Job />} />
      </Route>
    </Routes>
  );
};

export default App;
