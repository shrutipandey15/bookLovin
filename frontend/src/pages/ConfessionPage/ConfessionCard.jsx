import React from 'react';
import { MOOD_CONFIG } from '@config/moods'; 
import { Heart, Star, Sun } from 'lucide-react';
import { Link } from 'react-router-dom';

const ConfessionCard = ({ confession, style }) => {
  const { _id, content, soulName, moodKey } = confession;
  
  const moodPrimaryColor = MOOD_CONFIG[moodKey]?.themes.dragon['--primary'] || '#9ca3af';

  return (
    <Link to={`/confessions/${_id}`} style={style} className="absolute group">
      <div
        className="flex h-full w-full flex-col rounded-2xl border bg-black/30 p-6 font-body text-white shadow-lg backdrop-blur-sm transition-all duration-500 group-hover:!border-white/80 group-hover:scale-105"
        style={{
          borderColor: moodPrimaryColor, 
          boxShadow: `0 0 15px 0 ${moodPrimaryColor}30`, 
        }}
      >
        <p className="mb-4 flex-grow text-base leading-relaxed text-white/90 line-clamp-4">{content}</p>
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
    </Link>
  );
};

export default ConfessionCard;