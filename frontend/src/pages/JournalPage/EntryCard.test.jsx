import { render, screen, fireEvent } from '@testing-library/react'
import { vi, beforeEach, test, expect, describe } from 'vitest'
import EntryCard from './EntryCard'

// Mock dependencies
vi.mock('lucide-react', () => ({
  Heart: () => <div data-testid="heart-icon">Heart</div>,
  Sparkles: () => <div data-testid="sparkles-icon">Sparkles</div>,
  Zap: () => <div data-testid="zap-icon">Zap</div>,
  Star: () => <div data-testid="star-icon">Star</div>,
  Trash2: () => <div data-testid="trash-icon">Trash2</div>
}))

vi.mock('@components/MoodContext', () => ({
  MOOD_CONFIG: {
    heartbroken: { label: 'Heartbroken' },
    healing: { label: 'Healing' },
    empowered: { label: 'Empowered' }
  }
}))

vi.mock('./EntryStats', () => ({
  default: ({ entry }) => (
    <div data-testid="entry-stats">
      Stats for entry {entry._id}
    </div>
  )
}))

beforeEach(() => {
  vi.resetAllMocks()
})

describe('EntryCard', () => {
  const mockOnEdit = vi.fn()
  const mockOnDelete = vi.fn()
  const mockOnToggleFavorite = vi.fn()

  const defaultProps = {
    onEdit: mockOnEdit,
    onDelete: mockOnDelete,
    onToggleFavorite: mockOnToggleFavorite
  }

  const mockEntry = {
    _id: '123',
    title: 'Test Entry',
    content: 'This is a test journal entry with some content.',
    mood: 2,
    tags: ['test', 'journal', 'sample'],
    is_favorite: false,
    word_count: 10,
    created_at: '2023-01-01T12:00:00Z'
  }

  test('renders entry card with all main elements', () => {
    render(<EntryCard {...defaultProps} entry={mockEntry} />)

    expect(screen.getByText('Test Entry')).toBeInTheDocument()
    expect(screen.getByText('This is a test journal entry with some content.')).toBeInTheDocument()
    expect(screen.getByText('Healing')).toBeInTheDocument()
    expect(screen.getByTestId('sparkles-icon')).toBeInTheDocument()
    expect(screen.getByTestId('entry-stats')).toBeInTheDocument()
  })

  test('displays correct mood icon and label for heartbroken mood', () => {
    const heartbrokenEntry = { ...mockEntry, mood: 1 }

    render(<EntryCard {...defaultProps} entry={heartbrokenEntry} />)

    expect(screen.getByTestId('heart-icon')).toBeInTheDocument()
    expect(screen.getByText('Heartbroken')).toBeInTheDocument()
  })

  test('displays correct mood icon and label for empowered mood', () => {
    const empoweredEntry = { ...mockEntry, mood: 3 }

    render(<EntryCard {...defaultProps} entry={empoweredEntry} />)

    expect(screen.getByTestId('zap-icon')).toBeInTheDocument()
    expect(screen.getByText('Empowered')).toBeInTheDocument()
  })

  test('defaults to healing mood for invalid mood values', () => {
    const invalidMoodEntry = { ...mockEntry, mood: 999 }

    render(<EntryCard {...defaultProps} entry={invalidMoodEntry} />)

    expect(screen.getByTestId('sparkles-icon')).toBeInTheDocument()
    expect(screen.getByText('Healing')).toBeInTheDocument()
  })

  test('calls onEdit when card is clicked', () => {
    render(<EntryCard {...defaultProps} entry={mockEntry} />)

    fireEvent.click(screen.getByText('Test Entry'))

    expect(mockOnEdit).toHaveBeenCalledWith(mockEntry)
  })

  test('calls onToggleFavorite when favorite button is clicked', () => {
    render(<EntryCard {...defaultProps} entry={mockEntry} />)

    // Hover to make buttons visible
    const card = screen.getByText('Test Entry').closest('div')
    fireEvent.mouseEnter(card)

    const favoriteButton = screen.getByTestId('star-icon').closest('button')
    fireEvent.click(favoriteButton)

    expect(mockOnToggleFavorite).toHaveBeenCalledWith('123')
    expect(mockOnEdit).not.toHaveBeenCalled() // Should not trigger card click
  })

  test('calls onDelete when delete button is clicked', () => {
    render(<EntryCard {...defaultProps} entry={mockEntry} />)

    // Hover to make buttons visible
    const card = screen.getByText('Test Entry').closest('div')
    fireEvent.mouseEnter(card)

    const deleteButton = screen.getByTestId('trash-icon').closest('button')
    fireEvent.click(deleteButton)

    expect(mockOnDelete).toHaveBeenCalledWith('123')
    expect(mockOnEdit).not.toHaveBeenCalled() // Should not trigger card click
  })

  test('displays favorite star as filled when entry is favorited', () => {
    const favoriteEntry = { ...mockEntry, is_favorite: true }

    render(<EntryCard {...defaultProps} entry={favoriteEntry} />)

    // Hover to make buttons visible
    const card = screen.getByText('Test Entry').closest('div')
    fireEvent.mouseEnter(card)

    const starIcon = screen.getByTestId('star-icon')
    expect(starIcon).toBeInTheDocument()
  })

  test('renders without title when title is not provided', () => {
    const entryWithoutTitle = { ...mockEntry, title: '' }

    render(<EntryCard {...defaultProps} entry={entryWithoutTitle} />)

    expect(screen.queryByText('Test Entry')).not.toBeInTheDocument()
    expect(screen.getByText('This is a test journal entry with some content.')).toBeInTheDocument()
  })

  test('displays tags correctly', () => {
    render(<EntryCard {...defaultProps} entry={mockEntry} />)

    expect(screen.getByText('#test')).toBeInTheDocument()
    expect(screen.getByText('#journal')).toBeInTheDocument()
    expect(screen.getByText('#sample')).toBeInTheDocument()
  })

  test('shows limited number of tags with overflow indicator', () => {
    const entryWithManyTags = {
      ...mockEntry,
      tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5', 'tag6']
    }

    render(<EntryCard {...defaultProps} entry={entryWithManyTags} />)

    expect(screen.getByText('#tag1')).toBeInTheDocument()
    expect(screen.getByText('#tag2')).toBeInTheDocument()
    expect(screen.getByText('#tag3')).toBeInTheDocument()
    expect(screen.getByText('+3 more')).toBeInTheDocument()
    expect(screen.queryByText('#tag4')).not.toBeInTheDocument()
  })

  test('renders without tags when tags array is empty', () => {
    const entryWithoutTags = { ...mockEntry, tags: [] }

    render(<EntryCard {...defaultProps} entry={entryWithoutTags} />)

    expect(screen.queryByText('#test')).not.toBeInTheDocument()
  })

  test('renders without tags when tags property is undefined', () => {
    const entryWithoutTags = { ...mockEntry }
    delete entryWithoutTags.tags

    render(<EntryCard {...defaultProps} entry={entryWithoutTags} />)

    expect(screen.queryByText('#test')).not.toBeInTheDocument()
  })

  test('shows action buttons on hover', () => {
    render(<EntryCard {...defaultProps} entry={mockEntry} />)

    const card = screen.getByText('Test Entry').closest('div')

    // The buttons should be present in the DOM
    const starButton = screen.getByTestId('star-icon').closest('button')
    const deleteButton = screen.getByTestId('trash-icon').closest('button')

    expect(starButton).toBeInTheDocument()
    expect(deleteButton).toBeInTheDocument()

    // Test that hovering triggers state change by checking if buttons are clickable
    fireEvent.mouseEnter(card)

    // Buttons should be clickable after hover
    fireEvent.click(starButton)
    expect(mockOnToggleFavorite).toHaveBeenCalledWith('123')

    fireEvent.click(deleteButton)
    expect(mockOnDelete).toHaveBeenCalledWith('123')
  })

  test('renders EntryStats component with correct entry data', () => {
    render(<EntryCard {...defaultProps} entry={mockEntry} />)

    expect(screen.getByTestId('entry-stats')).toBeInTheDocument()
    expect(screen.getByText('Stats for entry 123')).toBeInTheDocument()
  })

  test('applies correct CSS classes and styles', () => {
    render(<EntryCard {...defaultProps} entry={mockEntry} />)

    const card = screen.getByText('Test Entry').closest('div')
    expect(card).toHaveClass('rounded-xl', 'shadow-sm', 'hover:shadow-md', 'transition-all', 'cursor-pointer', 'group', 'relative', 'p-6')
  })

  test('truncates long content with line-clamp', () => {
    const entryWithLongContent = {
      ...mockEntry,
      content: 'This is a very long journal entry that should be truncated when displayed in the card view. It contains multiple sentences and should demonstrate the line-clamp functionality working correctly to prevent the card from becoming too tall.'
    }

    render(<EntryCard {...defaultProps} entry={entryWithLongContent} />)

    const contentElement = screen.getByText(/This is a very long journal entry/)
    expect(contentElement).toHaveClass('line-clamp-3')
  })

  test('truncates long titles with line-clamp', () => {
    const entryWithLongTitle = {
      ...mockEntry,
      title: 'This is a very long title that should be truncated when displayed in the card'
    }

    render(<EntryCard {...defaultProps} entry={entryWithLongTitle} />)

    const titleElement = screen.getByText(/This is a very long title/)
    expect(titleElement).toHaveClass('line-clamp-2')
  })

  test('handles missing required props gracefully', () => {
    const minimalEntry = {
      _id: '123',
      content: 'Minimal entry',
      mood: 2
    }

    render(<EntryCard {...defaultProps} entry={minimalEntry} />)

    expect(screen.getByText('Minimal entry')).toBeInTheDocument()
    expect(screen.getByText('Healing')).toBeInTheDocument()
  })
})
