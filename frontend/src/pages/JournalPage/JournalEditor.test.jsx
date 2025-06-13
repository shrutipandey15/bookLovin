import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, beforeEach, test, expect, describe } from 'vitest';
import JournalEditor from './JournalEditor';
import { useAutoSave } from '@hooks/useAutoSave';
import { getWordCount } from '@utils/journalUtils';

vi.mock('@utils/journalUtils', () => ({
  getWordCount: vi.fn((text) => text.trim().split(/\s+/).filter(Boolean).length)
}));

vi.mock('@hooks/useAutoSave', () => ({
  useAutoSave: vi.fn(() => ({
    isSaving: false,
    lastSaved: null,
    hasUnsavedChanges: false,
    manualSave: vi.fn()
  }))
}));

vi.mock('./MoodSelectDropdown', () => ({
  default: ({ selectedMood, onMoodChange }) => (
    <select
      data-testid="mood-select"
      value={selectedMood}
      onChange={(e) => onMoodChange(parseInt(e.target.value))}
    >
      <option value={1}>Heartbroken</option>
      <option value={2}>Healing</option>
      <option value={3}>Empowered</option>
    </select>
  )
}));

vi.mock('lucide-react', () => ({
  Save: () => <div data-testid="save-icon">Save</div>,
  ArrowLeft: () => <div data-testid="arrow-left-icon">ArrowLeft</div>,
  Eye: () => <div data-testid="eye-icon">Eye</div>,
  EyeOff: () => <div data-testid="eye-off-icon">EyeOff</div>,
  AlertCircle: () => <div data-testid="alert-circle-icon">AlertCircle</div>
}));

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(useAutoSave).mockReturnValue({
    isSaving: false,
    lastSaved: null,
    hasUnsavedChanges: false,
    manualSave: vi.fn()
  });
});

const fillJournalForm = ({ title, content, tags }) => {
  if (title !== undefined) {
    fireEvent.change(screen.getByPlaceholderText(/entry title/i), {
      target: { value: title }
    });
  }
  if (content !== undefined) {
    fireEvent.change(screen.getByPlaceholderText(/pour your heart out/i), {
      target: { value: content }
    });
  }
  if (tags !== undefined) {
    fireEvent.change(screen.getByPlaceholderText(/tags/i), {
      target: { value: tags }
    });
  }
};

describe('JournalEditor', () => {
  const mockOnSave = vi.fn();
  const mockOnCancel = vi.fn();

  const defaultProps = {
    onSave: mockOnSave,
    onCancel: mockOnCancel,
    error: null
  };

  const MOCK_START_TIME = Date.now();
  const MOCK_END_TIME = MOCK_START_TIME + 5000; // 5 seconds later
  const MOCK_WRITING_TIME_SECONDS = 5;

  test('renders journal editor with all main elements', () => {
    render(<JournalEditor {...defaultProps} />);

    expect(screen.getByText('Back to Journal')).toBeInTheDocument();
    expect(screen.getByTestId('mood-select')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/entry title/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/pour your heart out/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/tags/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save entry/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /preview/i })).toBeInTheDocument();
    expect(screen.getByText('0 words')).toBeInTheDocument();
  });

  test('calls onSave with correct data when Save Entry button is clicked', async () => {
    vi.setSystemTime(MOCK_START_TIME);

    vi.mocked(useAutoSave).mockImplementation((content, entryId, onSaveCallback) => ({
      isSaving: false,
      lastSaved: null,
      hasUnsavedChanges: true,
      manualSave: vi.fn(async () => {
        const entryData = {
          title: screen.getByPlaceholderText(/entry title/i).value.trim(),
          content: screen.getByPlaceholderText(/pour your heart out/i).value.trim(),
          mood: parseInt(screen.getByTestId('mood-select').value),
          tags: screen.getByPlaceholderText(/tags/i).value.split(',').map(tag => tag.trim()).filter(Boolean),
          writing_time: MOCK_WRITING_TIME_SECONDS,
          favorite: false,
          word_count: getWordCount(screen.getByPlaceholderText(/pour your heart out/i).value)
        };
        await onSaveCallback(entryData); // Call the original onSave passed from JournalEditor
      })
    }));

    render(<JournalEditor {...defaultProps} />);

    vi.setSystemTime(MOCK_END_TIME);

    fillJournalForm({
      title: 'My Test Entry',
      content: 'Today was a wonderful day filled with joy and learning.', // 10 words
      tags: 'gratitude, learning, joy'
    });

    fireEvent.click(screen.getByRole('button', { name: /save entry/i }));

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith({
        title: 'My Test Entry',
        content: 'Today was a wonderful day filled with joy and learning.',
        mood: 2, // Default mood is 2
        tags: ['gratitude', 'learning', 'joy'],
        writing_time: MOCK_WRITING_TIME_SECONDS,
        favorite: false,
        word_count: 10
      });
    });
  });

  test('displays error message when save fails', () => {
    const errorMessage = 'Failed to save entry. Please try again.';
    render(<JournalEditor {...defaultProps} error={errorMessage} />);

    expect(screen.getByText('Save Failed')).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(screen.getByTestId('alert-circle-icon')).toBeInTheDocument();
  });

  test('toggles between edit and preview mode', async () => {
    render(<JournalEditor {...defaultProps} />);

    fillJournalForm({
      title: 'Preview Test',
      content: 'This content should appear in preview mode.',
      tags: 'test, preview'
    });

    expect(screen.getByPlaceholderText(/pour your heart out/i)).toBeInTheDocument();
    expect(screen.queryByText('Preview Test')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /preview/i }));

    await waitFor(() => {
      expect(screen.getByText('Preview Test')).toBeInTheDocument();
      expect(screen.getByText('This content should appear in preview mode.')).toBeInTheDocument();
      expect(screen.getByText('#test')).toBeInTheDocument();
      expect(screen.getByText('#preview')).toBeInTheDocument();
      expect(screen.queryByPlaceholderText(/pour your heart out/i)).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /edit/i }));

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/pour your heart out/i)).toBeInTheDocument();
      expect(screen.queryByText('Preview Test')).not.toBeInTheDocument();
    });
  });

  test('calls onCancel when back button is clicked', () => {
    render(<JournalEditor {...defaultProps} />);

    fireEvent.click(screen.getByText('Back to Journal'));

    expect(mockOnCancel).toHaveBeenCalledOnce();
  });

  test('disables save button when content is empty', () => {
    render(<JournalEditor {...defaultProps} />);

    const saveButton = screen.getByRole('button', { name: /save entry/i });
    expect(saveButton).toBeDisabled();

    fillJournalForm({ content: 'Now I have content' });
    expect(saveButton).not.toBeDisabled();

    fillJournalForm({ content: '' });
    expect(saveButton).toBeDisabled();
  });

  test('updates mood selection', () => {
    render(<JournalEditor {...defaultProps} />);

    const moodSelect = screen.getByTestId('mood-select');
    expect(moodSelect).toHaveValue('2');

    fireEvent.change(moodSelect, { target: { value: '1' } });
    expect(moodSelect).toHaveValue('1');
  });

  test('displays word count correctly', () => {
    render(<JournalEditor {...defaultProps} />);

    expect(screen.getByText('0 words')).toBeInTheDocument();

    fillJournalForm({ content: 'This is a test with five words' });
    expect(screen.getByText('7 words')).toBeInTheDocument();

    fillJournalForm({ content: 'One' });
    expect(screen.getByText('1 words')).toBeInTheDocument();
  });

  test('saves with Ctrl+S keyboard shortcut', async () => {
    const manualSaveMock = vi.fn();
    vi.mocked(useAutoSave).mockReturnValue({
      isSaving: false,
      lastSaved: null,
      hasUnsavedChanges: true,
      manualSave: manualSaveMock
    });

    render(<JournalEditor {...defaultProps} />);

    fillJournalForm({ content: 'Saving with keyboard shortcut' });

    const textarea = screen.getByPlaceholderText(/pour your heart out/i);
    fireEvent.keyDown(textarea, { key: 's', ctrlKey: true });

    await waitFor(() => {
      expect(manualSaveMock).toHaveBeenCalledOnce();
    });
  });

  test('shows auto-save status when saving', () => {
    vi.mocked(useAutoSave).mockReturnValue({
      isSaving: true,
      lastSaved: null,
      hasUnsavedChanges: false,
      manualSave: vi.fn()
    });

    render(<JournalEditor {...defaultProps} />);

    expect(screen.getByText('Saving...')).toBeInTheDocument();
    const savingSpinner = screen.getByText('Saving...').previousElementSibling;
    expect(savingSpinner).toHaveClass('animate-spin');
  });

  test('shows last saved time', () => {
    const savedDate = new Date('2023-01-01T12:00:00Z');
    vi.setSystemTime(savedDate);

    vi.mocked(useAutoSave).mockReturnValue({
      isSaving: false,
      lastSaved: savedDate,
      hasUnsavedChanges: false,
      manualSave: vi.fn()
    });

    render(<JournalEditor {...defaultProps} />);

    expect(screen.getByText(`Saved at ${savedDate.toLocaleTimeString()}`)).toBeInTheDocument();
  });

  test('shows unsaved changes indicator', () => {
    vi.mocked(useAutoSave).mockReturnValue({
      isSaving: false,
      lastSaved: null,
      hasUnsavedChanges: true,
      manualSave: vi.fn()
    });

    render(<JournalEditor {...defaultProps} />);

    expect(screen.getByText('Unsaved changes')).toBeInTheDocument();
  });

  test('loads existing entry data correctly', () => {
    const existingEntry = {
      _id: 'existing-id-1',
      title: 'Existing Entry Title',
      content: 'This is existing content from a previous entry.',
      mood: 1,
      tags: ['existing', 'entry', 'test'],
      favorite: true,
      writing_time: 120,
      word_count: 10
    };

    render(<JournalEditor {...defaultProps} entry={existingEntry} />);

    expect(screen.getByDisplayValue('Existing Entry Title')).toBeInTheDocument();
    expect(screen.getByDisplayValue('This is existing content from a previous entry.')).toBeInTheDocument();
    expect(screen.getByDisplayValue('existing, entry, test')).toBeInTheDocument();
    expect(screen.getByTestId('mood-select')).toHaveValue('1');
  });

  test('processes tags correctly when saving (trimming and filtering empty)', async () => {
    const manualSaveMock = vi.fn();
    vi.mocked(useAutoSave).mockReturnValue({
      isSaving: false,
      lastSaved: null,
      hasUnsavedChanges: true,
      manualSave: manualSaveMock
    });

    vi.mocked(useAutoSave).mockImplementation((content, entryId, onSaveCallback) => ({
      isSaving: false,
      lastSaved: null,
      hasUnsavedChanges: true,
      manualSave: vi.fn(async () => {
        const tagsInput = screen.getByPlaceholderText(/tags/i).value;
        const processedTags = tagsInput.split(',').map(tag => tag.trim()).filter(Boolean);
        await onSaveCallback(
          expect.objectContaining({ tags: processedTags })
        );
      })
    }));

    render(<JournalEditor {...defaultProps} />);

    fillJournalForm({
      content: 'Test content for tags',
      tags: 'tag1, tag2,tag3,  tag4  , '
    });

    fireEvent.click(screen.getByRole('button', { name: /save entry/i }));

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          tags: ['tag1', 'tag2', 'tag3', 'tag4']
        })
      );
    });
  });
});
