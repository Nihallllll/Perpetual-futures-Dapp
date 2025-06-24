import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import TradingDashboard from './pages/TradingDashboard';
import Faucet from './pages/Faucet';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-800">
      <Layout>
        <Routes>
          <Route path="/" element={<TradingDashboard />} />
          <Route path="/faucet" element={<Faucet />} />
        </Routes>
      </Layout>
    </div>
  );
}

export default App;