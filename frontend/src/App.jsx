import Home from './pages/Home';
import SOC from './pages/SOC.jsx';
import CIP from './pages/CIP.jsx';
import { Routes, Route } from 'react-router';
import Header from './components/Header.jsx';

const App = () => {
  return (
    <>
      <Header />
      <Routes>
        <Route index element={<Home />} />

        <Route path="job">
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
    </>
  );
};

export default App;
