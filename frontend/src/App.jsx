import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Layout from '@components/Layout';
import ProtectedRoute from '@components/ProtectedRoute';
import { MoodProvider } from '@components/MoodContext';
import HomePage from '@pages/HomePage';
import LoginPage from '@pages/LoginPage/LoginPage';
import RegistrationPage from '@pages/RegistrationPage/RegistrationPage';
import JournalPage from '@pages/JournalPage/JournalPage';
import FeedPage from '@pages/PostPage/Feed';
import PostEditor from '@components/PostEditor';
import SinglePostPage from '@pages/PostPage/SinglePostPage';
import ConfessionsPage from '@pages/ConfessionPage/ConfessionWallPage';
import ConfessionEditor from '@pages/ConfessionPage/ConfessionEditor';
import SingleConfessionPage from '@pages/ConfessionPage/SingleConfessionPage';
import BookSearchPage from '@pages/BookSearchPage/BookSearchPage';

import './App.css';
import './styles/themes.css';
function App() {
  return (
    <MoodProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegistrationPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/journal/*" element={<JournalPage />} />              
              <Route path="/posts" element={<FeedPage />} />
              <Route path="/posts/new" element={<PostEditor />} />
              <Route path="/posts/:id" element={<SinglePostPage />} />
              <Route path="/posts/:id/edit" element={<PostEditor />} />
              <Route path="/confessions" element={<ConfessionsPage />} />
              <Route path="/confessions/new" element={<ConfessionEditor />} />
              <Route path="/confessions/:id" element={<SingleConfessionPage />} />
              <Route path="/books/search" element={<BookSearchPage />} /> 
            </Route>
          </Routes>
        </Layout>
      </Router>
    </MoodProvider>
  );
}

export default App;