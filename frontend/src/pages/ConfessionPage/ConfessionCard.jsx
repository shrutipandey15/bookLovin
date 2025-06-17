import React from 'react';
// We need to import the full MOOD_CONFIG to access the theme colors
import { MOOD_CONFIG } from '@config/moods'; 
import { Heart, Star, Sun } from 'lucide-react';

const ConfessionCard = ({ confession, style }) => {
  const { content, soulName, moodKey } = confession;
  
  // FIX: Get the specific primary color for THIS card's mood.
  // We'll default to a neutral gray if the moodKey is somehow invalid.
  const moodPrimaryColor = MOOD_CONFIG[moodKey]?.themes.dragon['--primary'] || '#9ca3af';

  return (
    <div
      className="absolute flex flex-col rounded-2xl border bg-black/30 p-6 font-body text-white shadow-lg backdrop-blur-sm transition-all duration-500 hover:!border-white/80 hover:scale-105"
      style={{
        ...style, // Keep the random position from props
        borderColor: moodPrimaryColor, // Use the mood's specific color for the border
        // This adds the "glow" effect using the mood's color
        boxShadow: `0 0 15px 0 ${moodPrimaryColor}30`, // The 30 at the end adds 30% opacity
      }}
    >
      {/* ... rest of your card JSX is perfect ... */}
      <p className="mb-4 flex-grow text-base leading-relaxed text-white/90">{content}</p>
      <div className="mt-auto flex items-center justify-between border-t border-white/10 pt-4">
        <span className="text-sm italic text-white/60">~ {soulName}</span>
        <div className="flex items-center space-x-1">
          <button className="rounded-full p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-pink-300" aria-label="Feel this">
            <Heart className="h-4 w-4" />
          </button>
          <button className="rounded-full p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-yellow-300" aria-label="You're not alone">
            <Star className="h-4 w-4" />
          </button>
          <button className="rounded-full p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-blue-300" aria-label="Send light">
            <Sun className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfessionCard;