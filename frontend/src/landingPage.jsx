import { Link } from 'react-router-dom';

function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-fantasy text-purple-700 mb-4 tracking-wide">
            BookLovin
          </h1>
          <p className="text-gray-600 text-lg">
            Your personal reading companion and journal
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Link
            to="/posts"
            className="bg-purple-600 hover:bg-purple-700 text-white p-6 rounded-lg transition-colors duration-200 text-center group"
          >
            <div className="text-2xl mb-2">📚</div>
            <h3 className="text-xl font-semibold mb-2">View Posts</h3>
            <p className="text-purple-100">Browse book discussions and reviews</p>
          </Link>

          <Link
            to="/posts/create"
            className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-lg transition-colors duration-200 text-center group"
          >
            <div className="text-2xl mb-2">✍️</div>
            <h3 className="text-xl font-semibold mb-2">Create Post</h3>
            <p className="text-blue-100">Share your thoughts about books</p>
          </Link>

          <Link
            to="/journal"
            className="bg-green-600 hover:bg-green-700 text-white p-6 rounded-lg transition-colors duration-200 text-center group"
          >
            <div className="text-2xl mb-2">📖</div>
            <h3 className="text-xl font-semibold mb-2">Journal</h3>
            <p className="text-green-100">Keep track of your reading journey</p>
          </Link>

          <Link
            to="/login"
            className="bg-indigo-600 hover:bg-indigo-700 text-white p-6 rounded-lg transition-colors duration-200 text-center group"
          >
            <div className="text-2xl mb-2">🔐</div>
            <h3 className="text-xl font-semibold mb-2">Login</h3>
            <p className="text-indigo-100">Access your account</p>
          </Link>
        </div>

        <div className="text-center">
          <p className="text-gray-500 mb-4">New to BookLovin?</p>
          <Link
            to="/register"
            className="inline-block bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg transition-colors duration-200 font-medium"
          >
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
