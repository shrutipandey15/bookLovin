import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, beforeEach, test, expect, describe } from 'vitest'
import JournalPage from './JournalPage'
import axiosInstance from '@api/axiosInstance'

// Mock dependencies
vi.mock('@api/axiosInstance')
vi.mock('@utils/journalUtils', () => ({
  calculateStats: vi.fn(() => ({
    totalEntries: 5,
    streak: 3,
    favoriteEntries: 2,
    totalWords: 1500
  }))
}))
vi.mock('@components/MoodContext', () => ({
  MOOD_CONFIG: {
    heartbroken: { name: 'Heartbroken' },
    healing: { name: 'Healing' },
    empowered: { name: 'Empowered' }
  }
}))
vi.mock('./JournalEditor', () => ({
  default: ({ onSave, onCancel, entry, error }) => (
    <div data-testid="journal-editor">
      <button onClick={() => onSave({
        title: 'Test Entry',
        content: 'Test content',
        mood: 1,
        writing_time: 5,
        tags: [],
        is_favorite: false
      })}>
        Save Entry
      </button>
      <button onClick={onCancel}>Cancel</button>
      {entry && <span data-testid="editing-entry">Editing: {entry.title}</span>}
      {error && <div data-testid="editor-error">{error}</div>}
    </div>
  )
}))
vi.mock('./EntryCard', () => ({
  default: ({ entry, onEdit, onDelete, onToggleFavorite }) => (
    <div data-testid="entry-card" data-entry-id={entry._id}>
      <h3>{entry.title}</h3>
      <p>{entry.content}</p>
      <button onClick={() => onEdit(entry)}>Edit</button>
      <button onClick={() => onDelete(entry._id)}>Delete</button>
      <button onClick={() => onToggleFavorite(entry._id)}>
        {entry.is_favorite ? 'Unfavorite' : 'Favorite'}
      </button>
    </div>
  )
}))
vi.mock('@components/ConfirmModal', () => ({
  default: ({ isOpen, message, onConfirm, onCancel }) =>
    isOpen ? (
      <div data-testid="confirm-modal">
        <p>{message}</p>
        <button onClick={onConfirm}>Confirm</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    ) : null
}))

const mockEntries = [
  {
    uid: '1',
    title: 'First Entry',
    content: 'This is my first journal entry',
    mood: 1,
    writingTime: 10,
    favorite: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    tags: ['personal']
  },
  {
    uid: '2',
    title: 'Second Entry',
    content: 'Another day, another entry',
    mood: 2,
    writingTime: 15,
    favorite: false,
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
    tags: ['work']
  },
  {
    uid: '3',
    title: 'Third Entry',
    content: 'Feeling great today',
    mood: 3,
    writingTime: 8,
    favorite: false,
    created_at: '2024-01-03T00:00:00Z',
    updated_at: '2024-01-03T00:00:00Z',
    tags: ['motivation']
  }
]

beforeEach(() => {
  vi.resetAllMocks()
  // Mock successful fetch by default
  axiosInstance.get.mockResolvedValue({
    data: mockEntries
  })
})

describe('JournalPage', () => {
  test('renders journal page with header and stats', async () => {
    render(<JournalPage />)

    expect(screen.getByText('My Journal')).toBeInTheDocument()
    expect(screen.getByText('Your private space for thoughts, feelings, and reflections')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /new entry/i })).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('5')).toBeInTheDocument() // Total entries
      expect(screen.getByText('3')).toBeInTheDocument() // Streak
      expect(screen.getByText('2')).toBeInTheDocument() // Favorites
      expect(screen.getByText('300')).toBeInTheDocument() // Avg words (1500/5)
    })
  })

  test('fetches and displays journal entries on load', async () => {
    render(<JournalPage />)

    await waitFor(() => {
      expect(axiosInstance.get).toHaveBeenCalledWith('/journal', { params: {} })
      expect(screen.getByText('First Entry')).toBeInTheDocument()
      expect(screen.getByText('Second Entry')).toBeInTheDocument()
      expect(screen.getByText('Third Entry')).toBeInTheDocument()
    })
  })

  test('shows loading state initially', () => {
    render(<JournalPage />)
    expect(screen.getByText('Loading entries...')).toBeInTheDocument()
  })

  test('shows error message when fetch fails', async () => {
    const errorMessage = 'Failed to load entries'
    axiosInstance.get.mockRejectedValueOnce({
      response: { data: { detail: errorMessage } }
    })

    render(<JournalPage />)

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })
  })

  test('filters entries by search term', async () => {
    render(<JournalPage />)

    await waitFor(() => {
      expect(screen.getByText('First Entry')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText('Search your entries...')
    fireEvent.change(searchInput, { target: { value: 'first' } })

    await waitFor(() => {
      expect(axiosInstance.get).toHaveBeenCalledWith('/journal', {
        params: { search: 'first' }
      })
    })
  })

  test('filters entries by mood', async () => {
    render(<JournalPage />)

    await waitFor(() => {
      expect(screen.getByText('First Entry')).toBeInTheDocument()
    })

    const moodFilter = screen.getByDisplayValue('All Moods')
    fireEvent.change(moodFilter, { target: { value: 'heartbroken' } })

    await waitFor(() => {
      expect(axiosInstance.get).toHaveBeenCalledWith('/journal', {
        params: { mood: '1' }
      })
    })
  })

  test('opens journal editor when clicking new entry', async () => {
    render(<JournalPage />)

    await waitFor(() => {
      expect(screen.getByText('First Entry')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /new entry/i }))

    expect(screen.getByTestId('journal-editor')).toBeInTheDocument()
    expect(screen.queryByText('First Entry')).not.toBeInTheDocument()
  })

  test('opens journal editor for editing existing entry', async () => {
    render(<JournalPage />)

    await waitFor(() => {
      expect(screen.getByText('First Entry')).toBeInTheDocument()
    })

    const editButton = screen.getAllByText('Edit')[0]
    fireEvent.click(editButton)

    expect(screen.getByTestId('journal-editor')).toBeInTheDocument()
    expect(screen.getByTestId('editing-entry')).toBeInTheDocument()
  })

  test('saves new entry successfully', async () => {
    axiosInstance.post.mockResolvedValueOnce({
      data: { uid: '4', title: 'Test Entry' }
    })

    render(<JournalPage />)

    await waitFor(() => {
      expect(screen.getByText('First Entry')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /new entry/i }))

    const saveButton = screen.getByText('Save Entry')
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(axiosInstance.post).toHaveBeenCalledWith('/journal/', {
        title: 'Test Entry',
        content: 'Test content',
        mood: 1,
        writingTime: 5,
        tags: [],
        favorite: false
      })
      expect(axiosInstance.get).toHaveBeenCalledTimes(2) // Initial fetch + refetch after save
    })
  })

  test('updates existing entry successfully', async () => {
    axiosInstance.put.mockResolvedValueOnce({
      data: { uid: '1', title: 'Updated Entry' }
    })

    render(<JournalPage />)

    await waitFor(() => {
      expect(screen.getByText('First Entry')).toBeInTheDocument()
    })

    const editButton = screen.getAllByText('Edit')[0]
    fireEvent.click(editButton)

    const saveButton = screen.getByText('Save Entry')
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(axiosInstance.put).toHaveBeenCalledWith('/journal/1', {
        title: 'Test Entry',
        content: 'Test content',
        mood: 1,
        writingTime: 5,
        tags: [],
        favorite: false
      })
    })
  })

  test('shows error when save fails', async () => {
    const errorMessage = 'Failed to save entry'
    axiosInstance.post.mockRejectedValueOnce({
      response: { data: { detail: errorMessage } }
    })

    render(<JournalPage />)

    await waitFor(() => {
      expect(screen.getByText('First Entry')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /new entry/i }))

    const saveButton = screen.getByText('Save Entry')
    fireEvent.click(saveButton)

    // Error should be displayed in the editor
    await waitFor(() => {
      expect(screen.getByTestId('editor-error')).toBeInTheDocument()
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
      expect(screen.getByTestId('journal-editor')).toBeInTheDocument() // Still in editor
    })
  })

  test('cancels editing and returns to main view', async () => {
    render(<JournalPage />)

    await waitFor(() => {
      expect(screen.getByText('First Entry')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /new entry/i }))
    expect(screen.getByTestId('journal-editor')).toBeInTheDocument()

    const cancelButton = screen.getByText('Cancel')
    fireEvent.click(cancelButton)

    expect(screen.queryByTestId('journal-editor')).not.toBeInTheDocument()
    expect(screen.getByText('First Entry')).toBeInTheDocument()
  })

  test('shows confirm modal when deleting entry', async () => {
    render(<JournalPage />)

    await waitFor(() => {
      expect(screen.getByText('First Entry')).toBeInTheDocument()
    })

    const deleteButton = screen.getAllByText('Delete')[0]
    fireEvent.click(deleteButton)

    expect(screen.getByTestId('confirm-modal')).toBeInTheDocument()
    expect(screen.getByText(/are you sure you want to delete/i)).toBeInTheDocument()
  })

  test('deletes entry when confirmed', async () => {
    axiosInstance.delete.mockResolvedValueOnce({})

    render(<JournalPage />)

    await waitFor(() => {
      expect(screen.getByText('First Entry')).toBeInTheDocument()
    })

    const deleteButton = screen.getAllByText('Delete')[0]
    fireEvent.click(deleteButton)

    const confirmButton = screen.getByText('Confirm')
    fireEvent.click(confirmButton)

    await waitFor(() => {
      expect(axiosInstance.delete).toHaveBeenCalledWith('/journal/1')
      expect(screen.queryByTestId('confirm-modal')).not.toBeInTheDocument()
    })
  })

  test('cancels delete when modal is cancelled', async () => {
    render(<JournalPage />)

    await waitFor(() => {
      expect(screen.getByText('First Entry')).toBeInTheDocument()
    })

    const deleteButton = screen.getAllByText('Delete')[0]
    fireEvent.click(deleteButton)

    const cancelButton = screen.getByText('Cancel')
    fireEvent.click(cancelButton)

    expect(screen.queryByTestId('confirm-modal')).not.toBeInTheDocument()
    expect(axiosInstance.delete).not.toHaveBeenCalled()
  })

  test('shows error when delete fails', async () => {
    const errorMessage = 'Failed to delete entry'
    axiosInstance.delete.mockRejectedValueOnce({
      response: { data: { detail: errorMessage } }
    })

    render(<JournalPage />)

    await waitFor(() => {
      expect(screen.getByText('First Entry')).toBeInTheDocument()
    })

    const deleteButton = screen.getAllByText('Delete')[0]
    fireEvent.click(deleteButton)

    const confirmButton = screen.getByText('Confirm')
    fireEvent.click(confirmButton)

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })
  })

  test('toggles favorite status successfully', async () => {
    axiosInstance.put.mockResolvedValueOnce({})

    render(<JournalPage />)

    await waitFor(() => {
      expect(screen.getByText('First Entry')).toBeInTheDocument()
    })

    const favoriteButton = screen.getAllByText('Unfavorite')[0] // First entry is favorite
    fireEvent.click(favoriteButton)

    await waitFor(() => {
      expect(axiosInstance.put).toHaveBeenCalledWith('/journal/1', {
        favorite: false
      })
    })
  })

  test('shows error when toggle favorite fails', async () => {
    const errorMessage = 'Failed to toggle favorite'
    axiosInstance.put.mockRejectedValueOnce({
      response: { data: { detail: errorMessage } }
    })

    render(<JournalPage />)

    await waitFor(() => {
      expect(screen.getByText('First Entry')).toBeInTheDocument()
    })

    const favoriteButton = screen.getAllByText('Unfavorite')[0]
    fireEvent.click(favoriteButton)

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })
  })

  test('shows empty state when no entries exist', async () => {
    axiosInstance.get.mockResolvedValueOnce({ data: [] })

    render(<JournalPage />)

    await waitFor(() => {
      expect(screen.getByText('No entries yet')).toBeInTheDocument()
      expect(screen.getByText('Start your journaling journey by creating your first entry')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /create first entry/i })).toBeInTheDocument()
    })
  })

  test('shows no results message when search/filter returns empty', async () => {
    render(<JournalPage />)

    await waitFor(() => {
      expect(screen.getByText('First Entry')).toBeInTheDocument()
    })

    // Mock empty response for search
    axiosInstance.get.mockResolvedValueOnce({ data: [] })

    const searchInput = screen.getByPlaceholderText('Search your entries...')
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } })

    await waitFor(() => {
      expect(screen.getByText('No entries found')).toBeInTheDocument()
      expect(screen.getByText('Try adjusting your search or filter criteria')).toBeInTheDocument()
    })
  })

  test('creates first entry from empty state', async () => {
    axiosInstance.get.mockResolvedValueOnce({ data: [] })

    render(<JournalPage />)

    await waitFor(() => {
      expect(screen.getByText('No entries yet')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /create first entry/i }))

    expect(screen.getByTestId('journal-editor')).toBeInTheDocument()
  })
})
