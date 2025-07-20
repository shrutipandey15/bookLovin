import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { searchBooks, addBookToShelf, clearSearchResults } from '@redux/booksSlice';
import { Search, BookPlus, Loader, X } from 'lucide-react';
import { useNotification } from '@components/Layout';

const BookResultCard = ({ book }) => {
    const dispatch = useDispatch();
    const { showNotification } = useNotification();

    const handleAddToShelf = (status) => {
        dispatch(addBookToShelf({ book, status }));
        showNotification(`Added "${book.title}" to your shelf!`);
    };

    return (
        <div className="flex gap-4 rounded-lg border border-secondary p-4 bg-card-background backdrop-blur-md">
            <img src={book.cover_image_url} alt={book.title} className="w-20 h-28 object-cover rounded shadow-md" />
            <div className="flex-1">
                <h3 className="font-bold text-lg text-primary">{book.title}</h3>
                <p className="text-sm text-secondary mb-2">by {book.author}</p>
                <p className="text-sm text-text-primary line-clamp-2">{book.description}</p>
                 <div className="mt-3 flex gap-2">
                    {/* MODIFIED: These buttons now have different styles for light and dark themes */}
                    <button 
                        onClick={() => handleAddToShelf('want_to_read')} 
                        className="text-xs px-3 py-1 rounded-full 
                                   bg-blue-100 text-blue-800 hover:bg-blue-200
                                   dark:bg-blue-500/20 dark:text-blue-300 dark:hover:bg-blue-500/40"
                    >
                        Want to Read
                    </button>
                    <button 
                        onClick={() => handleAddToShelf('reading')} 
                        className="text-xs px-3 py-1 rounded-full
                                   bg-yellow-100 text-yellow-800 hover:bg-yellow-200
                                   dark:bg-yellow-500/20 dark:text-yellow-300 dark:hover:bg-yellow-500/40"
                    >
                        Reading
                    </button>
                    <button 
                        onClick={() => handleAddToShelf('read')} 
                        className="text-xs px-3 py-1 rounded-full
                                   bg-green-100 text-green-800 hover:bg-green-200
                                   dark:bg-green-500/20 dark:text-green-300 dark:hover:bg-green-500/40"
                    >
                        Read
                    </button>
                </div>
            </div>
        </div>
    )
}

const BookSearchPage = () => {
  const [query, setQuery] = useState('');
  const dispatch = useDispatch();
  const { searchResults, searchStatus } = useSelector((state) => state.books);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      dispatch(searchBooks(query.trim()));
    }
  };

  const handleClear = () => {
    setQuery('');
    dispatch(clearSearchResults());
  }

  return (
    <div className="mx-auto max-w-4xl p-8 font-body">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-primary mb-2 flex items-center justify-center gap-3"><BookPlus /> Find Your Next Read</h1>
        <p className="text-secondary">Search for any book to add it to your shelves.</p>
      </header>

      <form onSubmit={handleSearch} className="flex gap-2 mb-8 sticky top-24 z-10">
        <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, author, or ISBN..."
              className="w-full rounded-lg border border-secondary bg-card-background backdrop-blur-sm py-3 pl-12 pr-10 text-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {query && <X onClick={handleClear} className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary cursor-pointer hover:text-primary" />}
        </div>
        <button type="submit" className="px-6 py-3 rounded-lg bg-primary text-text-contrast font-semibold hover:opacity-90 transition-opacity" disabled={searchStatus === 'loading'}>
            {searchStatus === 'loading' ? <Loader className="animate-spin" /> : 'Search'}
        </button>
      </form>
      
      <div className="space-y-4">
        {searchStatus === 'succeeded' && searchResults.length === 0 && query && (
             <p className="text-center text-secondary py-10">No books found for "{query}".</p>
        )}
        {searchResults.map(book => (
            <BookResultCard key={book.googleBooksId} book={book} />
        ))}
      </div>
    </div>
  );
};

export default BookSearchPage;
