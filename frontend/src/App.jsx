import Home from './pages/Home';
import JobTemplate from './layout/JobTemplate.jsx';
import SOC from './pages/SOC.jsx';
import CIP from './pages/CIP.jsx';
import { Routes, Route } from 'react-router';

const App = () => {
  return (
    <Routes>
      <Route index element={<Home />} />

      <Route path="job">
        <Route index element={<JobTemplate />} />

        <Route path="soc">
          <Route index element={<SOC />} />
          <Route path=":id" element={<SOC />} />
        </Route>

        <Route path="cip">
          <Route index element={<CIP />} />
          <Route path=":id" element={<CIP />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default App;
