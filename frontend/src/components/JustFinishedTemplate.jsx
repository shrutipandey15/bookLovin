import React from 'react';
import { Star } from 'lucide-react';

// This is a template component. It receives book data and user input as props.
const JustFinishedTemplate = ({ book, userInput, refProp }) => {
  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`w-8 h-8 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
    ));
  };

  return (
    // This outer div is what we will capture as an image.
    <div ref={refProp} className="w-[400px] h-[500px] bg-gray-800 text-white p-8 flex flex-col font-sans shadow-2xl">
      <h2 className="text-2xl font-bold text-center mb-4">Just Finished!</h2>
      <div className="flex-grow flex flex-col items-center justify-center text-center">
        <img
          src={book.cover_image_url}
          alt={book.title}
          className="w-40 h-56 object-cover rounded-md shadow-lg mb-4"
          // Add crossOrigin="anonymous" for html-to-image to work with external images
          crossOrigin="anonymous"
        />
        <h3 className="text-xl font-bold">{book.title}</h3>
        <p className="text-md text-gray-300 mb-4">by {book.author}</p>
        <div className="flex gap-1 mb-4">
          {renderStars(userInput.rating)}
        </div>
        <p className="text-sm italic text-gray-400">"{userInput.review}"</p>
      </div>
      <div className="text-center text-xs text-gray-500 mt-4">
        Created with Booklovin'
      </div>
    </div>
  );
};

export default JustFinishedTemplate;