import React from 'react';
import DraggableShelf from '@components/DraggableShelf';
import {
  Star,
  BookText,
  BookOpenCheck,
  BookMarked,
  X,
} from "lucide-react";

const BookshelfCarousel = ({
  favoritesShelf,
  readingShelf,
  wantToReadShelf,
  readShelf,
  dnfShelf,
  setSelectedBook,
}) => {
  return (
    <div className="space-y-10">
      <DraggableShelf 
        title="Favorites" 
        icon={<Star size={24} />} 
        books={favoritesShelf} 
        droppableId="favorites-shelf"
        onBookClick={setSelectedBook}
      />
      <DraggableShelf 
        title="Currently Reading" 
        icon={<BookText size={24} />} 
        books={readingShelf} 
        droppableId="reading-shelf"
        onBookClick={setSelectedBook}
      />
      <DraggableShelf 
        title="Want to Read" 
        icon={<BookOpenCheck size={24} />} 
        books={wantToReadShelf} 
        droppableId="want-to-read-shelf"
        onBookClick={setSelectedBook}
      />
      <DraggableShelf 
        title="Read" 
        icon={<BookMarked size={24} />} 
        books={readShelf} 
        droppableId="read-shelf"
        onBookClick={setSelectedBook}
      />
      <DraggableShelf 
        title="Did Not Finish" 
        icon={<X size={24} />} 
        books={dnfShelf} 
        droppableId="dnf-shelf"
        onBookClick={setSelectedBook}
      />
    </div>
  );
};

export default BookshelfCarousel;