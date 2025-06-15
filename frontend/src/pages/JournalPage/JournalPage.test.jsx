import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, beforeEach, test, expect, describe } from 'vitest';
import JournalPage from './JournalPage';
import axiosInstance from '@api/axiosInstance';

// Mock Dependencies
vi.mock('@api/axiosInstance');

vi.mock('@utils/journalUtils', () => ({
  getWordCount: vi.fn((content) => content?.split(' ').length || 0),
  calculateStats: vi.fn(() => ({
    totalEntries: 2,
    favoriteEntries: 1,
    totalWords: 450,
  }))
}));

vi.mock('@components/MoodContext', () => ({
  MOOD_CONFIG: {
    heartbroken: { label: 'Heartbroken', emoji: '💔' },
    healing: { label: 'Healing', emoji: '🌸' },
    empowered: { label: 'Empowered', emoji: '⚡' },
  },
  MOOD_KEY_TO_ENUM: {
    heartbroken: 1,
    healing: 2,
    empowered: 3,
  },
}));

vi.mock('./JournalEditor', () => ({
  default: ({ onSave, onCancel, entry, error }) => (
    <div data-testid="journal-editor">
      <button
        onClick={() =>
          onSave({
            title: 'Test Entry',
            content: 'Test content',
            mood: 1,
            writing_time: 5,
            tags: [],
            favorite: false,
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

vi.mock('./EntryCard', () => ({
  default: ({ entry, onEdit, onDelete, onToggleFavorite }) => (
    <div data-testid="entry-card" data-entry-id={entry._id}>
      <h3>{entry.title}</h3>
      <p>{entry.content}</p>
      <button onClick={() => onEdit(entry)}>Edit</button>
      <button onClick={() => onDelete(entry._id)}>Delete</button>
      <button
        onClick={() => onToggleFavorite(entry._id)}
        data-testid={`favorite-button-${entry._id}`}
      >
        {entry.favorite ? 'Unfavorite' : 'Favorite'}
      </button>
    </div>
  ),
}));

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

const mockEntries = [
  {
    uid: '1',
    title: 'First Entry',
    content: 'This is my first journal entry',
    mood: 1,
    writingTime: 10,
    favorite: true,
    creationTime: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    tags: ['personal'],
  },
  {
    uid: '2',
    title: 'Second Entry',
    content: 'Another day, another entry',
    mood: 2,
    writingTime: 15,
    favorite: false,
    creationTime: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
    tags: ['work'],
  },
];

const mockUserProfile = {
  currentStreak: 5,
  longestStreak: 10,
};

beforeEach(() => {
  vi.resetAllMocks();
  axiosInstance.get.mockImplementation((url) => {
    if (url === '/journal') {
      return Promise.resolve({ data: mockEntries });
    }
    if (url === '/auth/me') {
      return Promise.resolve({ data: mockUserProfile });
    }
    return Promise.reject(new Error('Unknown endpoint'));
  });
});

describe('JournalPage', () => {
  test('renders journal page with header', async () => {
    render(<JournalPage />);

    expect(screen.getByText('My Journal')).toBeInTheDocument();
    expect(screen.getByText('Your private space for thoughts, feelings, and reflections')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /new entry/i })).toBeInTheDocument();
  });

  test('displays stats correctly', async () => {
    render(<JournalPage />);

    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument(); // Total Entries
      expect(screen.getByText('5')).toBeInTheDocument(); // Current Streak
      expect(screen.getByText('10')).toBeInTheDocument(); // Longest Streak
      expect(screen.getByText('1')).toBeInTheDocument(); // Favorites
      expect(screen.getByText('225')).toBeInTheDocument(); // Avg Words (450/2)
    });
  });

  test('fetches and displays journal entries', async () => {
    render(<JournalPage />);

    await waitFor(() => {
      expect(axiosInstance.get).toHaveBeenCalledWith('/journal', { params: {} });
      expect(axiosInstance.get).toHaveBeenCalledWith('/auth/me');
      expect(screen.getByText('First Entry')).toBeInTheDocument();
      expect(screen.getByText('Second Entry')).toBeInTheDocument();
    });
  });

  test('shows loading state initially', () => {
    axiosInstance.get.mockReturnValueOnce(new Promise(() => {}));
    render(<JournalPage />);
    expect(screen.getByText('Loading entries...')).toBeInTheDocument();
  });

  test('shows error message when fetch fails', async () => {
    const errorMessage = 'Failed to load entries';
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
      expect(screen.getByText('First Entry')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search your entries...');
    fireEvent.change(searchInput, { target: { value: 'first' } });

    await waitFor(() => {
      expect(axiosInstance.get).toHaveBeenCalledWith('/journal', {
        params: { search: 'first' },
      });
    });
  });

  test('filters entries by mood', async () => {
    render(<JournalPage />);

    await waitFor(() => {
      expect(screen.getByText('First Entry')).toBeInTheDocument();
    });

    const moodFilter = screen.getByDisplayValue('All Moods');
    fireEvent.change(moodFilter, { target: { value: 'heartbroken' } });

    await waitFor(() => {
      expect(axiosInstance.get).toHaveBeenCalledWith('/journal', {
        params: { mood: 1 },
      });
    });
  });

  test('opens journal editor when clicking new entry', async () => {
    render(<JournalPage />);

    await waitFor(() => {
      expect(screen.getByText('First Entry')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /new entry/i }));

    expect(screen.getByTestId('journal-editor')).toBeInTheDocument();
    expect(screen.queryByText('First Entry')).not.toBeInTheDocument();
  });

  test('opens journal editor for editing entry', async () => {
    render(<JournalPage />);

    await waitFor(() => {
      expect(screen.getByText('First Entry')).toBeInTheDocument();
    });

    const editButton = screen.getAllByText('Edit')[0];
    fireEvent.click(editButton);

    expect(screen.getByTestId('journal-editor')).toBeInTheDocument();
    expect(screen.getByTestId('editing-entry')).toHaveTextContent('Editing: First Entry');
  });

  test('saves new entry successfully', async () => {
    axiosInstance.post.mockResolvedValueOnce({ data: { uid: 'new-id' } });

    render(<JournalPage />);
    await waitFor(() => expect(screen.getByText('First Entry')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: /new entry/i }));
    fireEvent.click(screen.getByText('Save Entry'));

    await waitFor(() => {
      expect(axiosInstance.post).toHaveBeenCalledWith('/journal/', {
        title: 'Test Entry',
        content: 'Test content',
        mood: 1,
        writingTime: 5,
        tags: [],
        favorite: false,
        wordCount: undefined,
      });
      expect(screen.queryByTestId('journal-editor')).not.toBeInTheDocument();
    });
  });

  test('updates existing entry successfully', async () => {
    axiosInstance.put.mockResolvedValueOnce({ data: { uid: '1' } });

    render(<JournalPage />);
    await waitFor(() => expect(screen.getByText('First Entry')).toBeInTheDocument());

    const editButton = screen.getAllByText('Edit')[0];
    fireEvent.click(editButton);
    fireEvent.click(screen.getByText('Save Entry'));

    await waitFor(() => {
      expect(axiosInstance.put).toHaveBeenCalledWith('/journal/1', {
        title: 'Test Entry',
        content: 'Test content',
        mood: 1,
        writingTime: 5,
        tags: [],
        favorite: false,
        wordCount: undefined,
      });
    });
  });

  test('shows error when saving fails', async () => {
    const errorMessage = 'Failed to save entry';
    axiosInstance.post.mockRejectedValueOnce({
      response: { data: { detail: errorMessage } },
    });

    render(<JournalPage />);
    await waitFor(() => expect(screen.getByText('First Entry')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: /new entry/i }));
    fireEvent.click(screen.getByText('Save Entry'));

    await waitFor(() => {
      expect(screen.getByTestId('editor-error')).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  test('cancels editing', async () => {
    render(<JournalPage />);
    await waitFor(() => expect(screen.getByText('First Entry')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: /new entry/i }));
    fireEvent.click(screen.getByText('Cancel'));

    expect(screen.queryByTestId('journal-editor')).not.toBeInTheDocument();
    expect(screen.getByText('First Entry')).toBeInTheDocument();
  });

  test('shows confirm modal when deleting entry', async () => {
    render(<JournalPage />);
    await waitFor(() => expect(screen.getByText('First Entry')).toBeInTheDocument());

    const deleteButton = screen.getAllByText('Delete')[0];
    fireEvent.click(deleteButton);

    expect(screen.getByTestId('confirm-modal')).toBeInTheDocument();
    expect(screen.getByText(/are you sure you want to delete/i)).toBeInTheDocument();
  });

  test('deletes entry when confirmed', async () => {
    axiosInstance.delete.mockResolvedValueOnce({});

    render(<JournalPage />);
    await waitFor(() => expect(screen.getByText('First Entry')).toBeInTheDocument());

    const deleteButton = screen.getAllByText('Delete')[0];
    fireEvent.click(deleteButton);
    fireEvent.click(screen.getByText('Confirm'));

    await waitFor(() => {
      expect(axiosInstance.delete).toHaveBeenCalledWith('/journal/1');
    });
  });

  test('toggles favorite status', async () => {
    axiosInstance.put.mockResolvedValue({});

    render(<JournalPage />);
    await waitFor(() => {
      expect(screen.getByTestId('favorite-button-1')).toHaveTextContent('Unfavorite');
    });

    const favoriteButton = screen.getByTestId('favorite-button-1');
    fireEvent.click(favoriteButton);

    await waitFor(() => {
      expect(axiosInstance.put).toHaveBeenCalledWith('/journal/1', {
        title: 'First Entry',
        content: 'This is my first journal entry',
        mood: 1,
        writingTime: 10,
        tags: ['personal'],
        favorite: false,
      });
    });
  });

  test('shows empty state when no entries exist', async () => {
    axiosInstance.get.mockImplementation((url) => {
      if (url === '/journal') {
        return Promise.resolve({ data: [] });
      }
      if (url === '/auth/me') {
        return Promise.resolve({ data: mockUserProfile });
      }
    });

    render(<JournalPage />);

    await waitFor(() => {
      expect(screen.getByText('No entries yet')).toBeInTheDocument();
      expect(screen.getByText('Start your journaling journey by creating your first entry')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create first entry/i })).toBeInTheDocument();
    });
  });

  test('shows no results when search returns empty', async () => {
    render(<JournalPage />);

    await waitFor(() => {
      expect(screen.getByText('First Entry')).toBeInTheDocument();
    });

    axiosInstance.get.mockResolvedValueOnce({ data: [] });

    const searchInput = screen.getByPlaceholderText('Search your entries...');
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

    await waitFor(() => {
      expect(screen.getByText('No entries found')).toBeInTheDocument();
      expect(screen.getByText('Try adjusting your search or filter criteria')).toBeInTheDocument();
    });
  });
});
