import { useDispatch } from 'react-redux';
import { reactToPost } from '@redux/postsSlice';
import { User } from 'lucide-react';
import { MOOD_ICONS } from '@config/moods';
import { REACTION_CONFIG } from '@config/reactions'; 

const PostCard = ({ post }) => {
  const dispatch = useDispatch();

  const handleReaction = (reactionType) => {
    dispatch(reactToPost({ postId: post.uid, reactionType }));
  };

  const { title, content, imageUrl, author } = post;
  const moodKey = post.moodKey || 'healing';
  const MoodIcon = MOOD_ICONS[moodKey];

  return (
    <div className="flex flex-col rounded-2xl border border-secondary bg-background p-6 font-body text-text-primary shadow-sm transition-all hover:border-primary hover:shadow-lg">
      
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
      
      <p className="mb-4 flex-grow text-base leading-relaxed text-text-primary">
        {content}
      </p>

      {imageUrl && (
        <img
          src={imageUrl}
          alt={title}
          className="mb-4 h-48 w-full rounded-lg border border-secondary object-cover"
        />
      )}
      
      <div className="mt-auto flex items-center justify-end space-x-2 border-t border-secondary pt-4">
        {Object.entries(REACTION_CONFIG).map(([key, { Icon, title }]) => (
          <button
            key={key}
            onClick={() => handleReaction(key)}
            className="flex items-center space-x-1.5 rounded-full px-3 py-1 text-secondary transition-colors hover:bg-primary/10 hover:text-primary"
            title={title} 
          >
            <Icon className="h-4 w-4" />
            <span className="text-sm font-medium">{post.reactions?.[key] || 0}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default PostCard;