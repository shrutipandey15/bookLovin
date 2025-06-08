import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, beforeEach, test, expect, describe } from 'vitest'
import JournalEditor from './JournalEditor'
import { useAutoSave } from '@hooks/useAutoSave'

// Mock dependencies
vi.mock('@utils/journalUtils', () => ({
  getWordCount: vi.fn((text) => text.trim().split(/\s+/).filter(Boolean).length)
}))

vi.mock('@hooks/useAutoSave', () => ({
  useAutoSave: vi.fn(() => ({
    isSaving: false,
    lastSaved: null,
    hasUnsavedChanges: false
  }))
}))

vi.mock('./MoodSelectDropdown', () => ({
  default: ({ selectedMood, onMoodChange }) => (
    <select
      data-testid="mood-select"
      value={selectedMood}
      onChange={(e) => onMoodChange(parseInt(e.target.value))}
    >
      <option value={1}>Happy</option>
      <option value={2}>Neutral</option>
      <option value={3}>Sad</option>
    </select>
  )
}))

// Mock Lucide React icons
vi.mock('lucide-react', () => ({
  Save: () => <div data-testid="save-icon">Save</div>,
  ArrowLeft: () => <div data-testid="arrow-left-icon">ArrowLeft</div>,
  Eye: () => <div data-testid="eye-icon">Eye</div>,
  EyeOff: () => <div data-testid="eye-off-icon">EyeOff</div>,
  AlertCircle: () => <div data-testid="alert-circle-icon">AlertCircle</div>
}))

beforeEach(() => {
  vi.resetAllMocks()
  // Reset the auto-save mock to default values
  vi.mocked(useAutoSave).mockReturnValue({
    isSaving: false,
    lastSaved: null,
    hasUnsavedChanges: false
  })
})

const fillJournalForm = ({ title, content, tags }) => {
  if (title) {
    fireEvent.change(screen.getByPlaceholderText(/entry title/i), {
      target: { value: title }
    })
  }
  if (content) {
    fireEvent.change(screen.getByPlaceholderText(/pour your heart out/i), {
      target: { value: content }
    })
  }
  if (tags) {
    fireEvent.change(screen.getByPlaceholderText(/tags/i), {
      target: { value: tags }
    })
  }
}

describe('JournalEditor', () => {
  const mockOnSave = vi.fn()
  const mockOnCancel = vi.fn()

  const defaultProps = {
    onSave: mockOnSave,
    onCancel: mockOnCancel
  }

  test('renders journal editor with all main elements', () => {
    render(<JournalEditor {...defaultProps} />)

    expect(screen.getByText('Back to Journal')).toBeInTheDocument()
    expect(screen.getByTestId('mood-select')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/entry title/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/pour your heart out/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/tags/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /save entry/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /preview/i })).toBeInTheDocument()
  })

  test('saves entry successfully with correct details', async () => {
    mockOnSave.mockResolvedValueOnce({ success: true })

    render(<JournalEditor {...defaultProps} />)

    fillJournalForm({
      title: 'My First Entry',
      content: 'Today was a wonderful day filled with joy and learning.',
      tags: 'gratitude, learning, joy'
    })

    fireEvent.click(screen.getByRole('button', { name: /save entry/i }))

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith({
        title: 'My First Entry',
        content: 'Today was a wonderful day filled with joy and learning.',
        mood: 2,
        tags: ['gratitude', 'learning', 'joy'],
        writing_time: expect.any(Number),
        is_favorite: false,
        word_count: 10
      })
    })
  })

  test('displays error message when save fails', async () => {
    const errorMessage = 'Failed to save entry. Please try again.'

    render(<JournalEditor {...defaultProps} error={errorMessage} />)

    expect(screen.getByText('Save Failed')).toBeInTheDocument()
    expect(screen.getByText(errorMessage)).toBeInTheDocument()
    expect(screen.getByTestId('alert-circle-icon')).toBeInTheDocument()
  })

  test('toggles between edit and preview mode', async () => {
    render(<JournalEditor {...defaultProps} />)

    fillJournalForm({
      title: 'Preview Test',
      content: 'This content should appear in preview mode.',
      tags: 'test, preview'
    })

    // Initially in edit mode
    expect(screen.getByPlaceholderText(/pour your heart out/i)).toBeInTheDocument()

    // Switch to preview mode
    fireEvent.click(screen.getByRole('button', { name: /preview/i }))

    expect(screen.getByText('Preview Test')).toBeInTheDocument()
    expect(screen.getByText('This content should appear in preview mode.')).toBeInTheDocument()
    expect(screen.getByText('#test')).toBeInTheDocument()
    expect(screen.getByText('#preview')).toBeInTheDocument()

    // Switch back to edit mode
    fireEvent.click(screen.getByRole('button', { name: /edit/i }))

    expect(screen.getByPlaceholderText(/pour your heart out/i)).toBeInTheDocument()
  })

  test('calls onCancel when back button is clicked', () => {
    render(<JournalEditor {...defaultProps} />)

    fireEvent.click(screen.getByText('Back to Journal'))

    expect(mockOnCancel).toHaveBeenCalledOnce()
  })

  test('disables save button when content is empty', () => {
    render(<JournalEditor {...defaultProps} />)

    const saveButton = screen.getByRole('button', { name: /save entry/i })
    expect(saveButton).toBeDisabled()

    // Add content
    fireEvent.change(screen.getByPlaceholderText(/pour your heart out/i), {
      target: { value: 'Now I have content' }
    })

    expect(saveButton).not.toBeDisabled()
  })

  test('updates mood selection', () => {
    render(<JournalEditor {...defaultProps} />)

    const moodSelect = screen.getByTestId('mood-select')
    expect(moodSelect).toHaveValue('2') // Default neutral mood

    fireEvent.change(moodSelect, { target: { value: '1' } })
    expect(moodSelect).toHaveValue('1')
  })

  test('displays word count correctly', () => {
    render(<JournalEditor {...defaultProps} />)

    expect(screen.getByText('0 words')).toBeInTheDocument()

    fireEvent.change(screen.getByPlaceholderText(/pour your heart out/i), {
      target: { value: 'This is a test with five words' }
    })

    expect(screen.getByText('7 words')).toBeInTheDocument()
  })

  test('saves with Ctrl+S keyboard shortcut', async () => {
    mockOnSave.mockResolvedValueOnce({ success: true })

    render(<JournalEditor {...defaultProps} />)

    fillJournalForm({
      content: 'Saving with keyboard shortcut'
    })

    const textarea = screen.getByPlaceholderText(/pour your heart out/i)
    fireEvent.keyDown(textarea, { key: 's', ctrlKey: true })

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalled()
    })
  })

  test('shows auto-save status when saving', () => {
    vi.mocked(useAutoSave).mockReturnValue({
      isSaving: true,
      lastSaved: null,
      hasUnsavedChanges: false
    })

    render(<JournalEditor {...defaultProps} />)

    expect(screen.getByText('Saving...')).toBeInTheDocument()
  })

  test('shows last saved time', () => {
    const savedTime = new Date('2023-01-01T12:00:00')
    vi.mocked(useAutoSave).mockReturnValue({
      isSaving: false,
      lastSaved: savedTime,
      hasUnsavedChanges: false
    })

    render(<JournalEditor {...defaultProps} />)

    expect(screen.getByText(`Saved at ${savedTime.toLocaleTimeString()}`)).toBeInTheDocument()
  })

  test('shows unsaved changes indicator', () => {
    vi.mocked(useAutoSave).mockReturnValue({
      isSaving: false,
      lastSaved: null,
      hasUnsavedChanges: true
    })

    render(<JournalEditor {...defaultProps} />)

    expect(screen.getByText('Unsaved changes')).toBeInTheDocument()
  })

  test('loads existing entry data correctly', () => {
    const existingEntry = {
      title: 'Existing Entry',
      content: 'This is existing content',
      mood: 1,
      tags: ['existing', 'entry'],
      is_favorite: true
    }

    render(<JournalEditor {...defaultProps} entry={existingEntry} />)

    expect(screen.getByDisplayValue('Existing Entry')).toBeInTheDocument()
    expect(screen.getByDisplayValue('This is existing content')).toBeInTheDocument()
    expect(screen.getByDisplayValue('existing, entry')).toBeInTheDocument()
    expect(screen.getByTestId('mood-select')).toHaveValue('1')
  })

  test('processes tags correctly when saving', async () => {
    mockOnSave.mockResolvedValueOnce({ success: true })

    render(<JournalEditor {...defaultProps} />)

    fillJournalForm({
      content: 'Test content',
      tags: 'tag1, tag2,tag3,  tag4  , '
    })

    fireEvent.click(screen.getByRole('button', { name: /save entry/i }))

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          tags: ['tag1', 'tag2', 'tag3', 'tag4']
        })
      )
    })
  })
})
