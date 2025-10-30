import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import BookSpine from '@components/BookSpine';

const DraggableShelf = ({ title, icon, books, droppableId, onBookClick }) => {
  if (droppableId !== 'favorites-shelf' && (!books || books.length === 0)) {
    return (
      <div>
        <h3 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
          {icon} {title} (0)
        </h3>
        <div className="flex items-center justify-center gap-1 p-4 h-56 bg-secondary/10 rounded-lg overflow-x-auto text-secondary italic text-sm">
          No books on this shelf yet.
        </div>
      </div>
    );
  }
  
  if (droppableId === 'favorites-shelf' && (!books || books.length === 0)) {
      return null;
  }

  return (
    <div>
      <h3 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
        {icon} {title} ({books.length})
      </h3>
      <Droppable 
        droppableId={droppableId} 
        direction="horizontal" 
        isDropDisabled={false}
        isCombineEnabled={false}
        ignoreContainerClipping={true} 
      >
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="flex items-end gap-1 p-4 h-56 bg-secondary/10 rounded-lg overflow-x-auto"
          >
            {books.map((book, index) => (
              <BookSpine 
                key={book.ol_key} 
                book={book} 
                index={index} 
                onBookClick={onBookClick} 
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default DraggableShelf;