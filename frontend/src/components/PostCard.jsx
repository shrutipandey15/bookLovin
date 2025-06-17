import { Heart, MessageCircle, Star, ThumbsUp, User } from 'lucide-react'; // Example icons
import { MOOD_CONFIG, MOOD_ICONS } from '@config/moods';

const PostCard = ({ post }) => {
  // Assume the post object now includes author info like `penName` and a `moodKey`
  const { title, content, imageUrl, author } = post;
  const moodKey = post.moodKey || 'healing'; // Default mood
  const MoodIcon = MOOD_ICONS[moodKey];

  return (
    // The card itself uses theme variables and has a subtle hover effect
    <div className="flex flex-col rounded-2xl border border-secondary bg-background p-6 font-body text-text-primary shadow-sm transition-all hover:border-primary hover:shadow-lg">
      
      {/* Card Header */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex min-w-0 items-center space-x-3">
          {MoodIcon && <MoodIcon className="h-5 w-5 flex-shrink-0 text-primary" />}
          <h2 className="flex-grow truncate text-xl font-semibold text-primary">{title}</h2>
        </div>
        <div className="flex items-center space-x-2 text-sm text-secondary">
          <User className="h-4 w-4" />
          <span>{author?.penName || 'Quiet Soul'}</span>
        </div>
      </div>
      
      {/* Card Content */}
      <p className="mb-4 flex-grow text-base leading-relaxed text-text-primary">
        {content}
      </p>

      {/* Optional Image */}
      {imageUrl && (
        <img
          src={imageUrl}
          alt={title}
          className="mb-4 h-48 w-full rounded-lg border border-secondary object-cover"
        />
      )}
      
      {/* Card Footer: Replaced "Likes" with "Resonance" actions */}
      <div className="mt-auto flex items-center justify-end space-x-2 border-t border-secondary pt-4">
        <button className="flex items-center space-x-1 rounded-full px-3 py-1 text-secondary transition-colors hover:bg-primary/10 hover:text-primary">
          <Heart className="h-4 w-4" />
          <span className="text-sm">Feel this</span>
        </button>
        <button className="flex items-center space-x-1 rounded-full px-3 py-1 text-secondary transition-colors hover:bg-primary/10 hover:text-primary">
          <Star className="h-4 w-4" />
          <span className="text-sm">You're not alone</span>
        </button>
      </div>
    </div>
  );
};

export default PostCard;