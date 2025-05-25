// Updated App.jsx

import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from '@pages/LoginPage/LoginPage';
import RegistrationPage from '@pages/RegistrationPage/RegistrationPage';
import Feed from '@components/Feed';
import CreatePost from '@pages/PostPage/CreatePost';
import LandingPage from '@pages/LandingPage';
import './App.css';
import './styles/themes.css';
// import './BookAnimations.css'; // Book animations
import Layout from '@components/Layout';

function App() {
  const [_isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  return (
    <Router>
      <Layout>
        <div className="w-full mx-auto">
          {/* Title moved to the landing page component for better control */}
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={
              <div className="w-full max-w-3xl mx-auto px-4 py-8">
                <h1 className="text-4xl font-fantasy text-center mb-8 tracking-wide">BookLovin</h1>
                <LoginPage />
              </div>
            } />
            <Route path="/register" element={
              <div className="w-full max-w-3xl mx-auto px-4 py-8">
                <h1 className="text-4xl font-fantasy text-center mb-8 tracking-wide">BookLovin</h1>
                <RegistrationPage />
              </div>
            } />
            <Route path="/posts" element={
              <div className="w-full max-w-3xl mx-auto px-4 py-8">
                <h1 className="text-4xl font-fantasy text-center mb-8 tracking-wide">BookLovin</h1>
                <Feed />
              </div>
            } />
            <Route path="/posts/create" element={
              <div className="w-full max-w-3xl mx-auto px-4 py-8">
                <h1 className="text-4xl font-fantasy text-center mb-8 tracking-wide">BookLovin</h1>
                <CreatePost />
              </div>
            } />
          </Routes>
        </div>
      </Layout>
    </Router>
  );
}

export default App;
