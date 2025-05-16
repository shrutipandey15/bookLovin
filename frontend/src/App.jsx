import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from '@pages/LoginPage/LoginPage';
import RegistrationPage from '@pages/RegistrationPage/RegistrationPage';
import Feed from '@components/Feed';
import CreatePost from '@pages/PostPage/CreatePost';
import './App.css';
import './styles/themes.css';
import Layout from '@components/Layout';
import BookLayout from '@components/BookLayout';

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
      <div className="w-full max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8 tracking-wide">BookLovin</h1>

        <Routes>
          <Route path="/" element={<BookLayout />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegistrationPage />} />
          <Route path="/posts" element={<Feed />} />
          <Route path="/posts/create" element={<CreatePost />} />
        </Routes>
      </div>
      </Layout>
    </Router>
  );
}

export default App;
