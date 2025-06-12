import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from '@pages/LoginPage/LoginPage';
import RegistrationPage from '@pages/RegistrationPage/RegistrationPage';
import Feed from '@components/Feed';
import CreatePost from '@pages/PostPage/CreatePost';
import LandingPage from './landingPage';
import './App.css';
import './styles/themes.css';
import Layout from '@components/Layout';
import { MoodProvider } from '@components/MoodContext';
import JournalPage from '@pages/JournalPage/JournalPage';

function App() {
  const [_isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  return (
    <MoodProvider>
      <Router>
        <Layout>
          <div className="w-full mx-auto">
            <Routes>
              {/* Add the landing page as the home route */}
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
              <Route path="/journal" element={
                <div className="w-full max-w-3xl mx-auto px-4 py-8">
                  <h1 className="text-4xl font-fantasy text-center mb-8 tracking-wide">BookLovin</h1>
                  <JournalPage />
                </div>
              } />
            </Routes>
          </div>
        </Layout>
      </Router>
    </MoodProvider>
  );
}

export default App;
