import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { searchOpenLibrary, addBookToShelf, clearSearchResults } from '@redux/booksSlice';
import { Search, BookPlus, Loader, X } from 'lucide-react';
import { useNotification } from '@components/Layout';

const BookResultCard = ({ book }) => {
    const dispatch = useDispatch();
    const { showNotification } = useNotification();

    const handleAddToShelf = (status) => {
        const shelfItemData = {
            ol_key: book.key,
            title: book.title,
            status: status,
            cover_id: book.cover_i,
            author_names: book.author_name,
        };
        console.log('Component sending:', shelfItemData);
        dispatch(addBookToShelf(shelfItemData));
        showNotification(`Added "${book.title}" to your shelf!`);
    };

    const coverUrl = book.cover_i
        ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
        : `https://via.placeholder.com/80x112?text=No+Cover`;

    return (
        <div className="flex gap-4 rounded-lg border border-secondary p-4 bg-card-background backdrop-blur-md">
            <img
                src={coverUrl}
                alt={`Cover for ${book.title}`}
                className="w-20 h-28 object-cover rounded shadow-md flex-shrink-0"
            />
            <div className="flex-1 min-w-0"> {/* Added min-w-0 for flex truncation */}
                <h3 className="font-bold text-lg text-primary truncate">{book.title}</h3>
                <p className="text-sm text-secondary mb-2 truncate">
                    by {book.author_names?.join(', ') || 'Unknown Author'}
                </p>
                {/* Description might not always be available from search, handle gracefully */}
                {/* <p className="text-sm text-text-primary line-clamp-2">{book.description || 'No description available.'}</p> */}
                 <div className="mt-3 flex flex-wrap gap-2"> {/* Added flex-wrap */}
                    <button
                        onClick={() => handleAddToShelf('want_to_read')}
                        className="text-xs px-3 py-1 rounded-full whitespace-nowrap
                                   bg-blue-100 text-blue-800 hover:bg-blue-200
                                   dark:bg-blue-500/20 dark:text-blue-300 dark:hover:bg-blue-500/40"
                    >
                        Want to Read
                    </button>
                    <button
                        onClick={() => handleAddToShelf('reading')}
                        className="text-xs px-3 py-1 rounded-full whitespace-nowrap
                                   bg-yellow-100 text-yellow-800 hover:bg-yellow-200
                                   dark:bg-yellow-500/20 dark:text-yellow-300 dark:hover:bg-yellow-500/40"
                    >
                        Currently Reading
                    </button>
                    <button
                        onClick={() => handleAddToShelf('read')}
                        className="text-xs px-3 py-1 rounded-full whitespace-nowrap
                                   bg-green-100 text-green-800 hover:bg-green-200
                                   dark:bg-green-500/20 dark:text-green-300 dark:hover:bg-green-500/40"
                    >
                        Read
                    </button>
                    <button
                        onClick={() => handleAddToShelf('did_not_finish')}
                        className="text-xs px-3 py-1 rounded-full whitespace-nowrap
                                   bg-red-100 text-red-800 hover:bg-red-200
                                   dark:bg-red-500/20 dark:text-red-300 dark:hover:bg-red-500/40"
                    >
                        Did Not Finish
                    </button>
                </div>
            </div>
        </div>
    )
}

const BookSearchPage = () => {
  const [query, setQuery] = useState('');
  const dispatch = useDispatch();
  const { searchResults, searchStatus, error } = useSelector((state) => state.books);

  useEffect(() => {
    return () => {
      dispatch(clearSearchResults());
    };
  }, [dispatch]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      dispatch(searchOpenLibrary({ query: query.trim(), limit: 20 }));
    }
  };

  const handleClear = () => {
    setQuery('');
    dispatch(clearSearchResults());
  }

  const renderResults = () => {
    if (searchStatus === 'loading') {
      return <div className="text-center py-10"><Loader className="animate-spin h-8 w-8 mx-auto text-primary" /></div>;
    }
    if (searchStatus === 'failed') {
      return <p className="text-center text-red-500 py-10">Search failed: {error || 'Please try again.'}</p>;
    }
    if (searchStatus === 'succeeded' && searchResults.length === 0 && query) {
      return <p className="text-center text-secondary py-10">No books found for "{query}".</p>;
    }
    if (searchStatus === 'succeeded' && searchResults.length > 0) {
      return searchResults.map(book => (
        <BookResultCard key={book.ol_key} book={book} />
      ));
    }
    return <p className="text-center text-secondary py-10">Start typing to search for books...</p>;
  }

  return (
    <div className="mx-auto max-w-4xl p-8 font-body">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-primary mb-2 flex items-center justify-center gap-3"><BookPlus /> Find Your Next Read</h1>
        <p className="text-secondary">Search the Open Library catalog.</p>
      </header>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-8 sticky top-4 z-10 bg-background py-4"> {/* Adjusted sticky position */}
        <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary pointer-events-none" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, author..."
              className="w-full rounded-lg border border-secondary bg-card-background backdrop-blur-sm py-3 pl-12 pr-10 text-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {/* Clear button */}
            {query && (
                <button type="button" onClick={handleClear} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-secondary hover:text-primary">
                    <X className="h-5 w-5" />
                </button>
            )}
        </div>
        <button
            type="submit"
            className="px-6 py-3 rounded-lg bg-primary text-text-contrast font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center" // Added flex for loader centering
            disabled={searchStatus === 'loading' || !query.trim()}
        >
            {searchStatus === 'loading' ? <Loader className="animate-spin h-5 w-5" /> : 'Search'}
        </button>
      </form>

      {/* Results Area */}
      <div className="space-y-4">
        {renderResults()}
      </div>
    </div>
  );
};

export default BookSearchPage;