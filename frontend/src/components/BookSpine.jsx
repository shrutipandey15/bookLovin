import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { Star } from 'lucide-react';

// Helper to get a consistent width based on page count
const getSpineWidth = (pageCount) => {
  if (!pageCount) return '28px'; // Default thin book
  if (pageCount < 200) return '28px';
  if (pageCount < 400) return '32px';
  if (pageCount < 600) return '36px';
  return '40px'; // Thick book
};

// Helper to get a consistent, muted color
const getSpineColor = (olKey) => {
  // A more muted, "bookish" color palette
  const colors = [
    'bg-sky-800',    // Muted Blue
    'bg-emerald-800', // Muted Green
    'bg-rose-800',    // Muted Red
    'bg-amber-800',   // Muted Gold/Brown
    'bg-indigo-800',  // Muted Purple
    'bg-slate-700'    // Muted Gray
  ];
  const hash = olKey.split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
  return colors[Math.abs(hash) % colors.length];
};

const BookSpine = ({ book, index, onBookClick }) => {
  const width = getSpineWidth(book.page_count);
  const color = getSpineColor(book.ol_key);

  return (
    <Draggable draggableId={book.ol_key} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onBookClick(book)} // <-- This opens the modal
          className={`flex-shrink-0 h-48 rounded-sm shadow-md ${color} text-white 
                      font-semibold flex items-start justify-center p-2 pt-3 relative 
                      cursor-grab ${snapshot.isDragging ? 'shadow-2xl scale-105' : ''}`}
          style={{
            ...provided.draggableProps.style,
            width: width,
          }}
          title={book.title}
        >
          {/* Favorite Star */}
          {book.is_favorite && (
            <Star className="h-4 w-4 text-yellow-300 absolute top-1 left-1/2 -translate-x-1/2" fill="currentColor" />
          )}

          {/* Fixed Vertical Title */}
          <div className="h-full w-full overflow-hidden relative">
            <span 
              className="[writing-mode:vertical-rl] text-sm leading-tight text-left 
                         transform rotate-180 absolute top-0 left-0 pt-4 max-h-full truncate"
            >
              {book.title}
            </span>
          </div>
          
          {/* Bookmark for 'Currently Reading' */}
          {book.status === 'reading' && book.progress_percent > 0 && (
            <div 
              className="absolute left-1/2 -translate-x-1/2 bg-primary w-2 h-4 -top-2 rounded-b-sm"
              style={{ top: `${book.progress_percent}%` }}
              title={`Progress: ${book.progress_percent}%`}
            />
          )}
        </div>
      )}
    </Draggable>
  );
};

export default BookSpine;