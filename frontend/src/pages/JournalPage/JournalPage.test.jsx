import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, beforeEach, test, expect, describe } from 'vitest';
import JournalPage from './JournalPage';
import axiosInstance from '@api/axiosInstance';

// Mock Dependencies
vi.mock('@api/axiosInstance');

// Mock a simplified version of journalUtils
vi.mock('@utils/journalUtils', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    calculateStats: vi.fn((entries) => {
      // A more realistic mock that calculates based on input
      if (!entries || entries.length === 0) {
        return { totalEntries: 0, favoriteEntries: 0, totalWords: 0 };
      }
      return {
        totalEntries: entries.length,
        favoriteEntries: entries.filter(e => e.favorite).length,
        totalWords: entries.reduce((sum, e) => sum + (e.wordCount || 0), 0),
      };
    }),
  };
});


vi.mock('@components/MoodContext', () => ({
  MOOD_CONFIG: {
    heartbroken: { label: 'Heartbroken', emoji: '💔', value: 1 },
    healing: { label: 'Healing', emoji: '🌸', value: 2 },
    empowered: { label: 'Empowered', emoji: '⚡', value: 3 },
  },
  MOOD_KEY_TO_ENUM: {
    heartbroken: 1,
    healing: 2,
    empowered: 3,
  },
   MOOD_ENUM_TO_KEY: {
    1: 'heartbroken',
    2: 'healing',
    3: 'empowered',
  },
}));

// Mock child components
vi.mock('./JournalEditor', () => ({
  default: ({ onSave, onCancel, entry }) => (
    <div data-testid="journal-editor">
      <button onClick={() => onSave({ title: 'Saved Title', content: 'Saved Content', mood: 1, writingTime: 120, wordCount: 2, tags: [], favorite: false })}>Save Entry</button>
      <button onClick={onCancel}>Cancel</button>
      {entry && <span data-testid="editing-entry">Editing: {entry.title}</span>}
    </div>
  )
}));
vi.mock('./EntryCard', () => ({
  default: ({ entry, onEdit, onDelete, onToggleFavorite }) => (
    <div data-testid="entry-card" data-entry-id={entry._id}>
      <h3>{entry.title}</h3>
      <button onClick={() => onEdit(entry)}>Edit</button>
      <button onClick={() => onDelete(entry._id)}>Delete</button>
      <button onClick={() => onToggleFavorite(entry._id)} data-testid={`favorite-button-${entry._id}`}>{entry.favorite ? 'Unfavorite' : 'Favorite'}</button>
    </div>
  )
}));
vi.mock('@components/ConfirmModal', () => ({
  default: ({ isOpen, onConfirm, onCancel }) => isOpen ? (
    <div data-testid="confirm-modal">
      <button onClick={onConfirm}>Confirm</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  ) : null
}));

// Mock Data
const mockEntries = [
  { uid: '1', title: 'First Entry', content: 'This is my first journal entry', mood: 1, writingTime: 120, wordCount: 6, favorite: true, creationTime: '2024-01-01T00:00:00Z', tags: ['personal'] },
  { uid: '2', title: 'Second Entry', content: 'Another day, another entry', mood: 2, writingTime: 180, wordCount: 5, favorite: false, creationTime: '2024-01-02T00:00:00Z', tags: ['work'] },
];

const mockUserProfile = { currentStreak: 5, longestStreak: 10 };

beforeEach(() => {
  vi.resetAllMocks();
  // Setup default mocks for GET requests
  axiosInstance.get.mockImplementation((url) => {
    if (url === '/journal') {
      return Promise.resolve({ data: mockEntries });
    }
    if (url === '/auth/me') {
      return Promise.resolve({ data: mockUserProfile });
    }
    return Promise.reject(new Error(`Unknown GET endpoint: ${url}`));
  });
});

describe('JournalPage', () => {
  test('fetches and displays journal entries and user stats', async () => {
    render(<JournalPage />);

    // Wait for entries to appear
    expect(await screen.findByText('First Entry')).toBeInTheDocument();
    expect(screen.getByText('Second Entry')).toBeInTheDocument();

    // Check that stats are rendered correctly based on mock data
    expect(screen.getByText('Total Entries')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument(); // totalEntries
    expect(screen.getByText('Day Streak')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument(); // currentStreak
  });

  test('filters entries by search term', async () => {
    render(<JournalPage />);
    expect(await screen.findByText('First Entry')).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText('Search your entries...');
    fireEvent.change(searchInput, { target: { value: 'first' } });

    await waitFor(() => {
      expect(axiosInstance.get).toHaveBeenCalledWith('/journal', { params: { search: 'first' } });
    });
  });

  test('filters entries by mood', async () => {
    render(<JournalPage />);
    expect(await screen.findByText('First Entry')).toBeInTheDocument();

    const moodFilter = screen.getByRole('combobox');
    fireEvent.change(moodFilter, { target: { value: 'heartbroken' } });

    await waitFor(() => {
      expect(axiosInstance.get).toHaveBeenCalledWith('/journal', { params: { mood: 1 } });
    });
  });

  test('opens and saves a new entry', async () => {
    axiosInstance.post.mockResolvedValue({ data: { uid: 'new-id' } });
    render(<JournalPage />);

    // Open editor
    fireEvent.click(screen.getByRole('button', { name: /new entry/i }));
    expect(await screen.findByTestId('journal-editor')).toBeInTheDocument();

    // Save entry
    fireEvent.click(screen.getByRole('button', { name: /save entry/i }));

    await waitFor(() => {
      expect(axiosInstance.post).toHaveBeenCalled();
      expect(screen.queryByTestId('journal-editor')).not.toBeInTheDocument();
    });
  });

  test('deletes an entry after confirmation', async () => {
    axiosInstance.delete.mockResolvedValue({});
    render(<JournalPage />);
    expect(await screen.findByText('First Entry')).toBeInTheDocument();

    // Click the first delete button
    fireEvent.click(screen.getAllByRole('button', { name: /delete/i })[0]);
    expect(await screen.findByTestId('confirm-modal')).toBeInTheDocument();

    // Confirm deletion
    fireEvent.click(screen.getByRole('button', { name: /confirm/i }));

    await waitFor(() => {
      expect(axiosInstance.delete).toHaveBeenCalledWith('/journal/1');
    });
  });

  test('toggles favorite status', async () => {
    axiosInstance.put.mockResolvedValue({});
    render(<JournalPage />);

    const favoriteButton = await screen.findByTestId('favorite-button-1');
    expect(favoriteButton).toHaveTextContent('Unfavorite'); // Initial state from mock

    fireEvent.click(favoriteButton);

    await waitFor(() => {
      // Check that the PUT request was sent with favorite: false
      expect(axiosInstance.put).toHaveBeenCalledWith('/journal/1', expect.objectContaining({ favorite: false }));
    });
  });

  // FIXED TEST
  test('shows empty state when no entries exist', async () => {
    // Override the default mock for this specific test
    axiosInstance.get.mockImplementation((url) => {
      if (url === '/journal') {
        return Promise.resolve({ data: [] }); // Return no entries
      }
      return Promise.resolve({ data: mockUserProfile });
    });

    render(<JournalPage />);

    // Assert that the correct "empty" message appears, not the "no results" message
    expect(await screen.findByText('Your journal is empty')).toBeInTheDocument();
    expect(screen.getByText(/Why not write your first entry now?/i)).toBeInTheDocument();
  });

  // FIXED TEST
  test('shows no results when search returns empty', async () => {
    render(<JournalPage />);

    // 1. Wait for the initial render to complete with the default mock data
    expect(await screen.findByText('First Entry')).toBeInTheDocument();

    // 2. Now, change the mock to return an empty array for the NEXT call
    axiosInstance.get.mockResolvedValue({ data: [] });

    // 3. Perform the search action
    const searchInput = screen.getByPlaceholderText('Search your entries...');
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

    // 4. Assert that the "no results" message appears and the old entries are gone
    await waitFor(() => {
      expect(screen.getByText('No entries found')).toBeInTheDocument();
      expect(screen.getByText(/Try adjusting your search or filter criteria/i)).toBeInTheDocument();
      expect(screen.queryByText('First Entry')).not.toBeInTheDocument();
    });
  });
});
