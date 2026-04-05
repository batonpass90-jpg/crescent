import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/home/Home';
import Sales from './pages/sales/Sales';
import Pipeline from './pages/pipeline/Pipeline';
import Work from './pages/work/Work';
import Analytics from './pages/analytics/Analytics';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="sales" element={<Sales />} />
          <Route path="pipeline" element={<Pipeline />} />
          <Route path="work" element={<Work />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
