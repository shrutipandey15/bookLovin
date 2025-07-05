import mockAIImage from '../assets/ai-art-sample.png';

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

const mockUserPosts = [
    { uid: 'post1', title: 'On the nature of solitude', content: 'Just finished a quiet afternoon with a good book...', author: { penName: 'Mock User' }, reactions: { heart: 5, sparkles: 2 }, moodKey: 'healing' },
    { uid: 'post2', title: 'Feeling empowered!', content: 'Read a book that completely changed my perspective...', author: { penName: 'Mock User' }, reactions: { zap: 12, sun: 4 }, moodKey: 'empowered' }
];

let mockUserShelves = JSON.parse(localStorage.getItem('mockUserShelves')) || [];
const persistShelves = () => {
    localStorage.setItem('mockUserShelves', JSON.stringify(mockUserShelves));
};

const simulateDelay = (ms = 400) => new Promise(resolve => setTimeout(resolve, ms));

export const mockBookService = {
  search: async (query) => {
    console.log(`MOCK SEARCH: Searching for "${query}"`);
    await simulateDelay();
    if (!query) return [];
    return mockBookSearchResults;
  },

  getShelves: async () => {
    console.log("MOCK SHELVES: Fetching user's shelves from localStorage");
    await simulateDelay();
    return [...mockUserShelves];
  },

  addToShelf: async (book, status) => {
    console.log(`MOCK SHELVES: Adding "${book.title}" to "${status}"`);
    await simulateDelay();
    const existingEntryIndex = mockUserShelves.findIndex(item => item.book.googleBooksId === book.googleBooksId);
    
    if (existingEntryIndex > -1) {
        mockUserShelves[existingEntryIndex].status = status;
    } else {
        const newShelfItem = {
            id: `shelf_${Date.now()}`,
            user_id: 'mock_user_123',
            status: status,
            book: book,
        };
        mockUserShelves.push(newShelfItem);
    }
    
    persistShelves();
    return [...mockUserShelves];
  },

  getUserProfile: async (username) => {
    console.log(`MOCK PROFILE: Fetching profile for ${username}`);
    await simulateDelay(500);
    return {
      user: { username: 'Mock User', email: 'user@example.com' },
      shelves: [...mockUserShelves],
      posts: [...mockUserPosts],
    };
  },
  generateAiImage: async (prompt) => {
    console.log(`MOCK AI: Generating image for prompt: "${prompt}"`);
    // Simulate the AI taking time to generate the image
    await new Promise(res => setTimeout(res, 4000));
    
    // In our mock, we just return a cool placeholder image.
    // The real backend would return the URL of the newly created art.
    console.log("MOCK AI: Generation complete.");
    return {
        // Using a placeholder image from Unsplash
        imageUrl: mockAIImage

    };
  }
};