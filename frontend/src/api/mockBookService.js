const mockBookSearchResults = [
  {
    googleBooksId: 'h9f2CgAAQBAJ',
    title: 'Project Hail Mary',
    author: 'Andy Weir',
    cover_image_url: 'http://books.google.com/books/content?id=h9f2CgAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api',
    description: 'A lone astronaut must save the earth from disaster in this cinematic thriller full of suspense, humor, and fascinating science.',
  },
  {
    googleBooksId: 'JikgEAAAQBAJ',
    title: 'The Midnight Library',
    author: 'Matt Haig',
    cover_image_url: 'http://books.google.com/books/content?id=JikgEAAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api',
    description: 'Between life and death there is a library, and within that library, the shelves go on forever. Every book provides a chance to try another life you could have lived.',
  },
  {
    googleBooksId: 'y_t-DwAAQBAJ',
    title: 'Klara and the Sun',
    author: 'Kazuo Ishiguro',
    cover_image_url: 'http://books.google.com/books/content?id=y_t-DwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api',
    description: 'A novel that looks at our changing world through the eyes of an unforgettable narrator, and explores the fundamental question: what does it mean to love?',
  },
];

let mockUserShelves = [
    // This will be populated as we add books
];

const simulateDelay = (ms = 400) => new Promise(resolve => setTimeout(resolve, ms));

export const mockBookService = {
  search: async (query) => {
    console.log(`MOCK SEARCH: Searching for "${query}"`);
    await simulateDelay();
    if (!query) return [];
    // In a real mock, you might filter, but for now, we'll just return the list
    return mockBookSearchResults;
  },

  getShelves: async () => {
    console.log("MOCK SHELVES: Fetching user's shelves");
    await simulateDelay();
    return [...mockUserShelves];
  },

  addToShelf: async (book, status) => {
    console.log(`MOCK SHELVES: Adding "${book.title}" to "${status}"`);
    await simulateDelay();
    const existingEntry = mockUserShelves.find(item => item.book.googleBooksId === book.googleBooksId);
    if (existingEntry) {
        // If book is already on a shelf, just update its status
        existingEntry.status = status;
    } else {
        // Otherwise, add a new entry
        const newShelfItem = {
            id: `shelf_${Date.now()}`,
            user_id: 'mock_user_123',
            status: status, // 'read', 'reading', 'want_to_read'
            book: book,
        };
        mockUserShelves.push(newShelfItem);
    }
    return [...mockUserShelves];
  }
};