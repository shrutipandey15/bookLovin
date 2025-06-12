import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, beforeEach, test, expect, describe } from 'vitest';
import JournalPage from './JournalPage';
import axiosInstance from '@api/axiosInstance';

// --- Mock Dependencies ---

// Mock axiosInstance for all API calls
vi.mock('@api/axiosInstance');

// Mock journalUtils to provide consistent statistics
vi.mock('@utils/journalUtils', () => ({
  calculateStats: vi.fn(() => ({
    totalEntries: 5,
    streak: 3,
    favoriteEntries: 2,
    totalWords: 1500,
  })),
}));

// Mock MoodContext with all necessary exports used by JournalPage and its children
vi.mock('@components/MoodContext', () => ({
  MOOD_CONFIG: {
    heartbroken: { label: 'Heartbroken', emoji: '💔', description: 'Processing difficult emotions' },
    healing: { label: 'Healing', emoji: '🌸', description: 'Finding strength and growth' },
    empowered: { label: 'Empowered', emoji: '⚡', description: 'Feeling confident and strong' },
  },
  MOOD_KEY_TO_ENUM: { // For mapping dropdown values to backend enums
    heartbroken: 1,
    healing: 2,
    empowered: 3,
  },
  MOOD_ENUM_TO_KEY: { // For mapping backend enums to UI keys (e.g., in EntryCard)
    1: 'heartbroken',
    2: 'healing',
    3: 'empowered',
  },
  MOOD_ICONS: { // For icons used by child components like EntryCard
    heartbroken: () => '<svg data-testid="heart-icon"></svg>',
    healing: () => '<svg data-testid="sparkles-icon"></svg>',
    empowered: () => '<svg data-testid="zap-icon"></svg>',
  },
  useMood: () => ({ // A minimal mock for useMood hook
    mood: 'healing',
    theme: 'coffee',
    setMood: vi.fn(),
    setTheme: vi.fn(),
    MOOD_CONFIG: {},
  }),
}));

// Mock JournalEditor component to control its behavior during tests
vi.mock('./JournalEditor', () => ({
  default: ({ onSave, onCancel, entry, error }) => (
    <div data-testid="journal-editor">
      <button
        onClick={() =>
          onSave({
            title: 'Test Entry',
            content: 'Test content',
            mood: 1, // Consistent mock data for saving
            writing_time: 5,
            tags: [],
            is_favorite: false,
          })
        }
      >
        Save Entry
      </button>
      <button onClick={onCancel}>Cancel</button>
      {entry && <span data-testid="editing-entry">Editing: {entry.title}</span>}
      {error && <div data-testid="editor-error">{error}</div>}
    </div>
  ),
}));

// Mock EntryCard component to control its rendering and interactions,
// crucial for the favorite button test fix.
vi.mock('./EntryCard', () => ({
  default: ({ entry, onEdit, onDelete, onToggleFavorite }) => (
    <div data-testid="entry-card" data-entry-id={entry._id}>
      <h3>{entry.title}</h3>
      <p>{entry.content}</p>
      <button onClick={() => onEdit(entry)}>Edit</button>
      <button onClick={() => onDelete(entry._id)}>Delete</button>
      <button
        onClick={() => onToggleFavorite(entry._id)}
        data-testid={`favorite-button-${entry._id}`} // Added unique data-testid
      >
        {entry.is_favorite ? 'Unfavorite' : 'Favorite'}{' '}
      </button>
    </div>
  ),
}));

// Mock ConfirmModal component
vi.mock('@components/ConfirmModal', () => ({
  default: ({ isOpen, message, onConfirm, onCancel }) =>
    isOpen ? (
      <div data-testid="confirm-modal">
        <p>{message}</p>
        <button onClick={onConfirm}>Confirm</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    ) : null,
}));

// Define mock journal entries with backend-like structure (numerical mood)
const mockEntries = [
  {
    uid: '1',
    title: 'First Entry',
    content: 'This is my first journal entry',
    mood: 1, // Heartbroken (corresponding to MOOD_KEY_TO_ENUM)
    writingTime: 10,
    favorite: true, // This entry is initially favorited
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    tags: ['personal'],
  },
  {
    uid: '2',
    title: 'Second Entry',
    content: 'Another day, another entry',
    mood: 2, // Healing
    writingTime: 15,
    favorite: false,
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
    tags: ['work'],
  },
  {
    uid: '3',
    title: 'Third Entry',
    content: 'Feeling great today',
    mood: 3, // Empowered
    writingTime: 8,
    favorite: false,
    created_at: '2024-01-03T00:00:00Z',
    updated_at: '2024-01-03T00:00:00Z',
    tags: ['motivation'],
  },
];

// --- Test Setup ---

beforeEach(() => {
  // Reset all mocks before each test to ensure isolation and a clean state
  vi.resetAllMocks();
  // Set default mock for axiosInstance.get, this will be overridden by specific tests
  // that need multiple GET calls in a sequence.
  axiosInstance.get.mockResolvedValue({
    data: mockEntries,
  });
});

// --- JournalPage Test Suite ---

describe('JournalPage', () => {
  test('renders journal page with header and stats', async () => {
    render(<JournalPage />);

    expect(screen.getByText('My Journal')).toBeInTheDocument();
    expect(
      screen.getByText('Your private space for thoughts, feelings, and reflections')
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /new entry/i })).toBeInTheDocument();

    await waitFor(() => {
      // Assert calculated stats from mock are displayed correctly
      expect(screen.getByText('5')).toBeInTheDocument(); // Total Entries
      expect(screen.getByText('3')).toBeInTheDocument(); // Day Streak
      expect(screen.getByText('2')).toBeInTheDocument(); // Favorites
      expect(screen.getByText('300')).toBeInTheDocument(); // Avg Words (1500 total words / 5 entries)
    });
  });

  test('fetches and displays journal entries on load', async () => {
    render(<JournalPage />);

    await waitFor(() => {
      expect(axiosInstance.get).toHaveBeenCalledWith('/journal', { params: {} });
      expect(screen.getByText('First Entry')).toBeInTheDocument();
      expect(screen.getByText('Second Entry')).toBeInTheDocument();
      expect(screen.getByText('Third Entry')).toBeInTheDocument();
    });
  });

  test('shows loading state initially', () => {
    // Override default mock to simulate a pending API request
    axiosInstance.get.mockReturnValueOnce(new Promise(() => {}));

    render(<JournalPage />);
    expect(screen.getByText('Loading entries...')).toBeInTheDocument();
  });

  test('shows error message when fetch fails', async () => {
    const errorMessage = 'Failed to load journal entries. Please try again.';
    axiosInstance.get.mockRejectedValueOnce({
      response: { data: { detail: errorMessage } },
    });

    render(<JournalPage />);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  test('filters entries by search term', async () => {
    render(<JournalPage />);

    await waitFor(() => {
      expect(screen.getByText('First Entry')).toBeInTheDocument(); // Ensure initial load
    });

    const searchInput = screen.getByPlaceholderText('Search your entries...');
    fireEvent.change(searchInput, { target: { value: 'first' } });

    await waitFor(() => {
      // Expect axios.get to be called with the search parameter for backend filtering
      expect(axiosInstance.get).toHaveBeenCalledWith('/journal', {
        params: { search: 'first' },
      });
    });
  });

  test('filters entries by mood', async () => {
    render(<JournalPage />);

    await waitFor(() => {
      expect(screen.getByText('First Entry')).toBeInTheDocument(); // Ensure initial load
    });

    const moodFilter = screen.getByDisplayValue('All Moods');
    // Select the 'Heartbroken' option, which maps to mood enum 1
    fireEvent.change(moodFilter, { target: { value: 'heartbroken' } });

    await waitFor(() => {
      // Expect axios.get to be called with the correct numerical mood enum
      expect(axiosInstance.get).toHaveBeenCalledWith('/journal', {
        params: { mood: 1 },
      });
    });
  });

  test('opens journal editor when clicking new entry button', async () => {
    render(<JournalPage />);

    await waitFor(() => {
      expect(screen.getByText('First Entry')).toBeInTheDocument(); // Wait for content to load
    });

    fireEvent.click(screen.getByRole('button', { name: /new entry/i }));

    // Expect the JournalEditor mock to be rendered and the main view to be hidden
    expect(screen.getByTestId('journal-editor')).toBeInTheDocument();
    expect(screen.queryByText('First Entry')).not.toBeInTheDocument();
  });

  test('opens journal editor for editing an existing entry', async () => {
    render(<JournalPage />);

    await waitFor(() => {
      expect(screen.getByText('First Entry')).toBeInTheDocument();
    });

    const editButton = screen.getAllByText('Edit')[0]; // Select the edit button for the first entry
    fireEvent.click(editButton);

    expect(screen.getByTestId('journal-editor')).toBeInTheDocument();
    // Verify editor is pre-populated with entry data (as mocked by EntryCard's onEdit)
    expect(screen.getByTestId('editing-entry')).toHaveTextContent('Editing: First Entry');
  });

  test('saves a new entry successfully', async () => {
    // Explicitly mock the GET/POST calls in sequence
    axiosInstance.get.mockResolvedValueOnce({ data: mockEntries }); // 1. For initial render
    axiosInstance.post.mockResolvedValueOnce({
      data: { uid: 'new-entry-id', title: 'New Test Entry' },
    }); // 2. For POSTing new entry
    axiosInstance.get.mockResolvedValueOnce({
      data: [
        ...mockEntries,
        {
          uid: 'new-entry-id',
          title: 'New Test Entry',
          content: '...',
          mood: 1,
          writingTime: 1,
          favorite: false,
          created_at: 'now',
          updated_at: 'now',
          tags: [],
        },
      ],
    }); // 3. For refetch after save

    render(<JournalPage />);
    await waitFor(() => expect(screen.getByText('First Entry')).toBeInTheDocument()); // Wait for initial load

    fireEvent.click(screen.getByRole('button', { name: /new entry/i }));
    fireEvent.click(screen.getByText('Save Entry')); // Click the save button in the mocked editor

    await waitFor(() => {
      // Verify POST request payload
      expect(axiosInstance.post).toHaveBeenCalledWith('/journal/', {
        title: 'Test Entry', // From JournalEditor mock
        content: 'Test content', // From JournalEditor mock
        mood: 1,
        writingTime: 5,
        tags: [],
        favorite: false,
      });
      // Expect initial GET + refetch GET calls
      expect(axiosInstance.get).toHaveBeenCalledTimes(2);
      // Editor should close and return to main view
      expect(screen.queryByTestId('journal-editor')).not.toBeInTheDocument();
    });
  });

  test('updates an existing entry successfully', async () => {
    // Explicitly mock the GET/PUT calls in sequence
    axiosInstance.get.mockResolvedValueOnce({ data: mockEntries }); // 1. For initial render
    axiosInstance.put.mockResolvedValueOnce({
      data: { uid: '1', title: 'Updated First Entry' },
    }); // 2. For PUTting updated entry
    axiosInstance.get.mockResolvedValueOnce({
      data: [{ ...mockEntries[0], title: 'Updated First Entry' }, mockEntries[1], mockEntries[2]],
    }); // 3. For refetch after update

    render(<JournalPage />);
    await waitFor(() => expect(screen.getByText('First Entry')).toBeInTheDocument()); // Wait for initial load

    const editButton = screen.getAllByText('Edit')[0];
    fireEvent.click(editButton);

    fireEvent.click(screen.getByText('Save Entry')); // Click save in mocked editor

    await waitFor(() => {
      // Verify PUT request payload and endpoint
      expect(axiosInstance.put).toHaveBeenCalledWith('/journal/1', {
        title: 'Test Entry', // From JournalEditor mock
        content: 'Test content', // From JournalEditor mock
        mood: 1,
        writingTime: 5,
        tags: [],
        favorite: false,
      });
      expect(axiosInstance.get).toHaveBeenCalledTimes(2); // Initial GET + refetch GET
      expect(screen.queryByTestId('journal-editor')).not.toBeInTheDocument();
    });
  });

  test('shows error when saving an entry fails', async () => {
    const errorMessage = 'Failed to save entry. Please try again.';
    axiosInstance.post.mockRejectedValueOnce({
      response: { data: { detail: errorMessage } },
    });

    render(<JournalPage />);
    await waitFor(() => expect(screen.getByText('First Entry')).toBeInTheDocument()); // Wait for initial load

    fireEvent.click(screen.getByRole('button', { name: /new entry/i }));
    fireEvent.click(screen.getByText('Save Entry'));

    await waitFor(() => {
      // Editor should remain open and display the error message
      expect(screen.getByTestId('editor-error')).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(screen.getByTestId('journal-editor')).toBeInTheDocument();
    });
  });

  test('cancels editing and returns to main view', async () => {
    render(<JournalPage />);
    await waitFor(() => expect(screen.getByText('First Entry')).toBeInTheDocument()); // Wait for initial load

    fireEvent.click(screen.getByRole('button', { name: /new entry/i }));
    expect(screen.getByTestId('journal-editor')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Cancel')); // Click cancel in mocked editor

    // Editor should close and entries should be visible again
    expect(screen.queryByTestId('journal-editor')).not.toBeInTheDocument();
    expect(screen.getByText('First Entry')).toBeInTheDocument();
  });

  test('shows confirm modal when deleting an entry', async () => {
    render(<JournalPage />);
    await waitFor(() => expect(screen.getByText('First Entry')).toBeInTheDocument()); // Wait for initial load

    const deleteButton = screen.getAllByText('Delete')[0]; // Get delete button for the first entry
    fireEvent.click(deleteButton);

    expect(screen.getByTestId('confirm-modal')).toBeInTheDocument();
    expect(screen.getByText(/are you sure you want to delete/i)).toBeInTheDocument();
  });

  test('deletes entry when confirmed in the modal', async () => {
    // Explicitly mock the GET and DELETE calls in sequence for this test
    axiosInstance.get.mockResolvedValueOnce({ data: mockEntries }); // 1. For initial render
    axiosInstance.delete.mockResolvedValueOnce({}); // 2. For the delete API call
    axiosInstance.get.mockResolvedValueOnce({ data: [mockEntries[1], mockEntries[2]] }); // 3. For refetch after delete

    render(<JournalPage />);

    await waitFor(() => {
      // Assert initial state: 3 entries are present
      expect(screen.getAllByTestId('entry-card')).toHaveLength(3);
      expect(screen.getByText('First Entry')).toBeInTheDocument();
    });

    const deleteButton = screen.getAllByText('Delete')[0];
    fireEvent.click(deleteButton);

    fireEvent.click(screen.getByText('Confirm')); // Click confirm in the mocked modal

    await waitFor(() => {
      expect(axiosInstance.delete).toHaveBeenCalledWith('/journal/1');
      expect(screen.queryByTestId('confirm-modal')).not.toBeInTheDocument();
      // Assert that the number of entries has decreased
      expect(screen.getAllByTestId('entry-card')).toHaveLength(2);
      // Explicitly assert that 'First Entry' is no longer in the document
      expect(screen.queryByText('First Entry')).not.toBeInTheDocument();
      // And ensure the remaining entries are still there
      expect(screen.getByText('Second Entry')).toBeInTheDocument();
      expect(screen.getByText('Third Entry')).toBeInTheDocument();
    });
  });

  test('cancels delete when modal is cancelled', async () => {
    render(<JournalPage />);
    await waitFor(() => expect(screen.getByText('First Entry')).toBeInTheDocument()); // Wait for initial load

    const deleteButton = screen.getAllByText('Delete')[0];
    fireEvent.click(deleteButton);

    fireEvent.click(screen.getByText('Cancel')); // Click cancel in the mocked modal

    expect(screen.queryByTestId('confirm-modal')).not.toBeInTheDocument();
    expect(axiosInstance.delete).not.toHaveBeenCalled(); // Delete API should not be called
    expect(screen.getByText('First Entry')).toBeInTheDocument(); // Entry should still be present
  });

  test('shows error when delete fails', async () => {
    const errorMessage = 'Failed to delete entry. Please try again.';
    axiosInstance.delete.mockRejectedValueOnce({
      response: { data: { detail: errorMessage } },
    });

    render(<JournalPage />);
    await waitFor(() => expect(screen.getByText('First Entry')).toBeInTheDocument()); // Wait for initial load

    const deleteButton = screen.getAllByText('Delete')[0];
    fireEvent.click(deleteButton);

    fireEvent.click(screen.getByText('Confirm')); // Click confirm in the mocked modal

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  test('toggles favorite status successfully', async () => {
    // Explicitly mock GET for initial render
    axiosInstance.get.mockResolvedValueOnce({ data: mockEntries });
    axiosInstance.put.mockResolvedValue({}); // Mock PUT to succeed for toggling

    render(<JournalPage />);

    await waitFor(() => {
      // Initial state: Entry 1 is favorite ('Unfavorite' button), others are not ('Favorite' buttons)
      expect(screen.getByTestId('favorite-button-1')).toHaveTextContent('Unfavorite');
      expect(screen.getByTestId('favorite-button-2')).toHaveTextContent('Favorite');
    });

    // First toggle: Unfavorite Entry 1 (it's currently 'Unfavorite')
    const favoriteButton1 = screen.getByTestId('favorite-button-1');
    fireEvent.click(favoriteButton1);

    await waitFor(() => {
      expect(axiosInstance.put).toHaveBeenCalledWith('/journal/1', {
        favorite: false, // Toggling from true to false
      });
      // Verify UI reflects the change for Entry 1 (button text changes)
      expect(screen.getByTestId('favorite-button-1')).toHaveTextContent('Favorite');
    });

    // Second toggle: Favorite Entry 1 again (its button is now 'Favorite')
    fireEvent.click(favoriteButton1); // Click the same specific button again

    await waitFor(() => {
      expect(axiosInstance.put).toHaveBeenCalledWith('/journal/1', {
        favorite: true, // Toggling from false to true
      });
      // Verify UI reflects the change for Entry 1 (button text changes back)
      expect(screen.getByTestId('favorite-button-1')).toHaveTextContent('Unfavorite');
    });
  });

  test('shows error when toggle favorite fails', async () => {
    const errorMessage = 'Failed to toggle favorite status. Please try again.';
    axiosInstance.put.mockRejectedValueOnce({
      response: { data: { detail: errorMessage } },
    });

    render(<JournalPage />);
    await waitFor(() => {
      expect(screen.getByTestId('favorite-button-1')).toHaveTextContent('Unfavorite');
    });

    const favoriteButton1 = screen.getByTestId('favorite-button-1');
    fireEvent.click(favoriteButton1);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  test('shows empty state when no entries exist', async () => {
    axiosInstance.get.mockResolvedValueOnce({ data: [] }); // Mock empty response for initial load

    render(<JournalPage />);

    await waitFor(() => {
      expect(screen.getByText('No entries yet')).toBeInTheDocument();
      expect(
        screen.getByText('Start your journaling journey by creating your first entry')
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /create first entry/i })
      ).toBeInTheDocument();
      expect(screen.queryByText('First Entry')).not.toBeInTheDocument(); // No entries should be displayed
    });
  });

  test('shows no results message when search/filter returns empty', async () => {
    render(<JournalPage />);

    await waitFor(() => {
      expect(screen.getByText('First Entry')).toBeInTheDocument();
    });

    // Mock empty response for the subsequent axios.get call after search/filter
    axiosInstance.get.mockResolvedValueOnce({ data: [] });

    const searchInput = screen.getByPlaceholderText('Search your entries...');
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

    await waitFor(() => {
      expect(axiosInstance.get).toHaveBeenCalledWith('/journal', { params: { search: 'nonexistent' } });
      expect(screen.getByText('No entries found')).toBeInTheDocument();
      expect(screen.getByText('Try adjusting your search or filter criteria')).toBeInTheDocument();
      expect(screen.queryByText('First Entry')).not.toBeInTheDocument(); // Existing entries should be filtered out
    });
  });

  test('creates first entry from empty state button click', async () => {
    axiosInstance.get.mockResolvedValueOnce({ data: [] }); // Simulate initial empty state

    render(<JournalPage />);

    await waitFor(() => {
      expect(screen.getByText('No entries yet')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /create first entry/i }));

    expect(screen.getByTestId('journal-editor')).toBeInTheDocument();
  });
});
