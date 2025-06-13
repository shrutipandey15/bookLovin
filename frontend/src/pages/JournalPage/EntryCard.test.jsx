import { render, screen, fireEvent } from '@testing-library/react';
import { vi, beforeEach, test, expect, describe } from 'vitest';
import EntryCard from './EntryCard';

// Mock dependencies
vi.mock('lucide-react', () => ({
  Star: () => <div data-testid="star-icon">Star</div>,
  Trash2: () => <div data-testid="trash-icon">Trash2</div>
}));

vi.mock('@components/MoodContext', () => ({
  MOOD_CONFIG: {
    heartbroken: { label: 'Heartbroken', color: '#e11d48' },
    healing: { label: 'Healing', color: '#10b981' },
    empowered: { label: 'Empowered', color: '#3b82f6' }
  },
  MOOD_ENUM_TO_KEY: {
    1: 'heartbroken',
    2: 'healing',
    3: 'empowered'
  },
  MOOD_ICONS: {
    heartbroken: () => <div data-testid="heart-icon">Heart</div>,
    healing: () => <div data-testid="sparkles-icon">Sparkles</div>,
    empowered: () => <div data-testid="zap-icon">Zap</div>
  }
}));

vi.mock('./EntryStats', () => ({
  default: ({ entry }) => (
    <div data-testid="entry-stats">Stats for {entry._id}</div>
  )
}));

beforeEach(() => {
  vi.resetAllMocks();
});

describe('EntryCard', () => {
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnToggleFavorite = vi.fn();

  const defaultProps = {
    onEdit: mockOnEdit,
    onDelete: mockOnDelete,
    onToggleFavorite: mockOnToggleFavorite
  };

  const mockEntry = {
    _id: '123',
    title: 'Test Entry',
    content: 'This is a test journal entry.',
    mood: 2,
    tags: ['test', 'journal'],
    favorite: false
  };

  test('renders entry with title and content', () => {
    render(<EntryCard {...defaultProps} entry={mockEntry} />);

    expect(screen.getAllByText('Test Entry')).toHaveLength(2); // Title appears twice in component
    expect(screen.getByText('This is a test journal entry.')).toBeInTheDocument();
  });

  test('displays correct mood icon', () => {
    render(<EntryCard {...defaultProps} entry={mockEntry} />);

    expect(screen.getByTestId('sparkles-icon')).toBeInTheDocument();
  });

  test('calls onEdit when card is clicked', () => {
    const { container } = render(<EntryCard {...defaultProps} entry={mockEntry} />);

    const card = container.querySelector('div[class*="rounded-xl"]');
    fireEvent.click(card);

    expect(mockOnEdit).toHaveBeenCalledWith(mockEntry);
  });

  test('calls onToggleFavorite when favorite button is clicked', () => {
    render(<EntryCard {...defaultProps} entry={mockEntry} />);

    const favoriteButton = screen.getByTestId('star-icon').closest('button');
    fireEvent.click(favoriteButton);

    expect(mockOnToggleFavorite).toHaveBeenCalledWith('123');
    expect(mockOnEdit).not.toHaveBeenCalled();
  });

  test('calls onDelete when delete button is clicked', () => {
    render(<EntryCard {...defaultProps} entry={mockEntry} />);

    const deleteButton = screen.getByTestId('trash-icon').closest('button');
    fireEvent.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledWith('123');
    expect(mockOnEdit).not.toHaveBeenCalled();
  });

  test('displays tags correctly', () => {
    render(<EntryCard {...defaultProps} entry={mockEntry} />);

    expect(screen.getByText('#test')).toBeInTheDocument();
    expect(screen.getByText('#journal')).toBeInTheDocument();
  });

  test('shows overflow indicator for many tags', () => {
    const entryWithManyTags = {
      ...mockEntry,
      tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5']
    };

    render(<EntryCard {...defaultProps} entry={entryWithManyTags} />);

    expect(screen.getByText('+2 more')).toBeInTheDocument();
  });

  test('renders EntryStats component', () => {
    render(<EntryCard {...defaultProps} entry={mockEntry} />);

    expect(screen.getByTestId('entry-stats')).toBeInTheDocument();
  });

  test('handles entry without title', () => {
    const entryWithoutTitle = { ...mockEntry, title: '' };

    render(<EntryCard {...defaultProps} entry={entryWithoutTitle} />);

    expect(screen.getByText('Untitled Entry')).toBeInTheDocument();
  });

  test('handles entry without tags', () => {
    const entryWithoutTags = { ...mockEntry, tags: [] };

    render(<EntryCard {...defaultProps} entry={entryWithoutTags} />);

    expect(screen.queryByText('#test')).not.toBeInTheDocument();
  });
});
