import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Signin from './Components/Signin';
import Signup from './Components/Signup';
import Dashboard from './Components/Dashboard';
import './App.css';
import './index.css';
import './Components/Dashboard.css'

function App() {
  // You could add authentication state here to determine where to redirect
  const isAuthenticated = false; // This would come from your auth system

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/signin" element={<Signin />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={
            // Optional: Add authentication protection
            // isAuthenticated ? <Dashboard /> : <Navigate to="/signin" />
            <Dashboard />
          } />
          {/* Add default route to redirect from root */}
          <Route path="/" element={<Navigate to="/signin" />} />
          {/* Add a catch-all route for 404 errors */}
          <Route path="*" element={<Navigate to="/signin" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;