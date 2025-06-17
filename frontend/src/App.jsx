import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Layout from '@components/Layout';
import ProtectedRoute from '@components/ProtectedRoute'; // Import our new protected route
import { MoodProvider } from '@components/MoodContext';

// Import Pages
import LandingPage from './landingPage'; // We will use this again
import HomePage from '@pages/HomePage';
import LoginPage from '@pages/LoginPage/LoginPage';
import RegistrationPage from '@pages/RegistrationPage/RegistrationPage';
import JournalPage from '@pages/JournalPage/JournalPage';
import FeedPage from '@pages/PostPage/Feed';
import PostEditor from '@components/PostEditor';
import SinglePostPage from '@pages/PostPage/SinglePostPage';
import ConfessionsPage from '@pages/ConfessionPage/ConfessionWallPage';

import './App.css';
import './styles/themes.css';

function App() {
  return (
    <MoodProvider>
      <Router>
        <Layout>
          <Routes>
            {/* --- PUBLIC ROUTES --- */}
            {/* Anyone can see these pages */}
            {/* <Route path="/" element={<LandingPage />} /> */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegistrationPage />} />

            {/* --- PROTECTED ROUTES --- */}
            {/* Users must be logged in to access these. */}
            {/* The ProtectedRoute component handles the logic. */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/journal" element={<JournalPage />} />
              <Route path="/letters" element={<JournalPage />} />
              <Route path="/posts" element={<FeedPage />} />
              <Route path="/posts/new" element={<PostEditor />} />
              <Route path="/posts/:id" element={<SinglePostPage />} />
              <Route path="/posts/:id/edit" element={<PostEditor />} />
              <Route path="/confessions" element={<ConfessionsPage />} />
            </Route>

          </Routes>
        </Layout>
      </Router>
    </MoodProvider>
  );
}

export default App;