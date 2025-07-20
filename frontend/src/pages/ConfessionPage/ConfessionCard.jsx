import React from 'react';
import { MOOD_CONFIG } from '@config/moods'; 
import { Heart, Star, Sun } from 'lucide-react';
import { Link } from 'react-router-dom';

const ConfessionCard = ({ confession }) => {
  const { _id, content, soulName, moodKey } = confession || {};
  
  const moodPrimaryColor = MOOD_CONFIG[moodKey]?.themes?.starlight?.['--primary'] || '#9ca3af';

  if (!confession) {
    return null;
  }

  return (
    <Link to={`/confessions/${_id}`} className="group">
      <div
        className="flex h-full min-h-[180px] w-full flex-col rounded-2xl border bg-card-background p-6 font-body text-text-primary shadow-lg backdrop-blur-md transition-all duration-300 group-hover:!border-primary/80 group-hover:scale-105"
        style={{
          borderColor: moodPrimaryColor, 
          boxShadow: `0 0 15px 0 ${moodPrimaryColor}20`, 
        }}
      >
        <p className="mb-4 flex-grow text-base leading-relaxed text-text-primary/90 line-clamp-4">{content}</p>
        <div className="mt-auto flex items-center justify-between border-t border-border-color pt-4">
          <span className="text-sm italic text-text-secondary">~ {soulName}</span>
          <div className="flex items-center space-x-1">
            <button className="rounded-full p-2 text-text-secondary transition-colors hover:bg-primary/10 hover:text-pink-400" aria-label="Feel this">
              <Heart className="h-4 w-4" />
            </button>
            <button className="rounded-full p-2 text-text-secondary transition-colors hover:bg-primary/10 hover:text-yellow-400" aria-label="You're not alone">
              <Star className="h-4 w-4" />
            </button>
            <button className="rounded-full p-2 text-text-secondary transition-colors hover:bg-primary/10 hover:text-blue-400" aria-label="Send light">
              <Sun className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ConfessionCard;