import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/LoginPage/LoginPage';
import RegistrationPage from './pages/RegistrationPage/RegistrationPage';
import './App.css';
import './styles/themes.css';
import Layout from './components/Layout';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  return (
    <Router>
      <Layout>
      <div className="app">
        <h1>BookLovin</h1>

        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/register" element={<RegistrationPage />} />
        </Routes>
      </div>
      </Layout>
    </Router>
  );
}

export default App;
