import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from '@pages/LoginPage/LoginPage';
import RegistrationPage from '@pages/RegistrationPage/RegistrationPage';
import FeedPage from '@pages/PostPage/Feed';
import PostEditor from '@components/PostEditor';
import SinglePostPage from '@pages/PostPage/SinglePostPage';
// import LandingPage from './landingPage';
import './App.css';
import './styles/themes.css';
import Layout from '@components/Layout';
import { MoodProvider } from '@components/MoodContext';
import JournalPage from '@pages/JournalPage/JournalPage';
import ConfessionsPage from '@pages/ConfessionPage/ConfessionWallPage';

// FIX: Import the necessary components for the Letters feature
import { LettersInbox } from '@pages/JournalPage/LetterInbox'; 
import LetterComposer from '@pages/JournalPage/LetterComposer';
import LetterViewer from '@pages/JournalPage/LetterViewer';
import { Home } from 'lucide-react';
import HomePage from '@pages/HomePage';
// Note: You might want to move these letter components to their own '@pages/LetterPage' directory for cleanliness.


function App() {
  const [_isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  // For a fully built-out feature, we would manage the state for letters in JournalPage
  // or a new LettersPage component that calls the useLetters hook.
  // This routing setup assumes a parent component will handle the state.

  return (
    <MoodProvider>
      <Router>
        <Layout>
          <Routes>
            {/* Core and Auth Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegistrationPage />} />
            
            {/* Journal Route */}
            <Route path="/journal" element={<JournalPage />} />

            {/* Post Routes */}
            <Route path="/posts" element={<FeedPage />} />
            <Route path="/posts/new" element={<PostEditor />} />
            <Route path="/posts/:id" element={<SinglePostPage />} />
            <Route path="/posts/:id/edit" element={<PostEditor />} />

            {/* Confessions Route */}
            <Route path="/confessions" element={<ConfessionsPage />} />

            {/* FIX: Add dedicated routes for the Letters feature */}
            <Route path="/letters" element={<JournalPage />} /> {/* Or a new dedicated LettersPage */}
            <Route path="/letters/new" element={<LetterComposer />} />
            <Route path="/letters/:id" element={<LetterViewer />} />

          </Routes>
        </Layout>
      </Router>
    </MoodProvider>
  );
}

export default App;