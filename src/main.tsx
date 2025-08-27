import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Index from './pages/Index.tsx'
import HotDeals from './pages/HotDeals.tsx'
import SearchPage from './pages/Search.tsx'
import NotFound from './pages/NotFound.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(
  <Router>
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/hot-deals" element={<HotDeals />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </Router>
);
