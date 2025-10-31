import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { reactToPost } from '@redux/postsSlice';
import { REACTION_CONFIG } from '@config/reactions';
import { User, MessageCircle } from 'lucide-react';

const PostCard = ({ post }) => {
  const dispatch = useDispatch();
  const hasMedia = post.mediaUrl && post.mediaUrl.length > 0;
  
  const handleReaction = (e, reactionType) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(reactToPost({ postId: post.uid, reactionType }));
  };

  if (hasMedia) {
    return (
        <div className="rounded-2xl border border-secondary bg-background font-body text-text-primary shadow-sm overflow-hidden">
            <header className="p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center">{post.author?.username.charAt(0) || 'A'}</div>
                <div>
                    <p className="font-semibold">{post.author?.username || 'Anonymous'}</p>
                    <p className="text-xs text-secondary">Inspired by a book</p>
                </div>
            </header>
            <Link to={`/posts/${post.uid}`}>
                <img src={post.mediaUrl} alt={`Post by ${post.author?.username}`} className="w-full aspect-square object-cover" />
            </Link>
            <div className="p-4">
                <p className="text-sm">
                    <span className="font-semibold">{post.author?.username || 'Anonymous'}</span> {post.caption_text}
                </p>
                <div className="mt-4 flex items-center justify-start space-x-1">
                    {Object.entries(REACTION_CONFIG).map(([key, {  title }]) => (
                        <button key={key} onClick={(e) => handleReaction(e, key)} title={title} className="flex items-center space-x-1.5 rounded-full px-3 py-1 text-secondary transition-colors hover:bg-primary/10 hover:text-primary">
                            <Icon className="h-4 w-4" /><span className="text-sm font-medium">{post.reactions?.[key] || 0}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
  }

  // Card for text-only posts
  return (
    <Link to={`/posts/${post.uid}`} className="flex h-96">
        <div className={`w-full rounded-2xl p-8 flex flex-col text-center shadow-sm transition-all hover:shadow-lg `}>
            <div className="m-auto">
                <p className="text-3xl font-serif leading-snug">"{post.caption_text}"</p>
            </div>
            <div className="mt-auto">
                <p className="text-sm opacity-80">by <span className="font-semibold">{post.author?.username || 'Anonymous'}</span></p>
                <div className="mt-2 flex justify-center space-x-1">
                    {Object.entries(REACTION_CONFIG).map(([key, { title }]) => (
                        <button key={key} onClick={(e) => handleReaction(e, key)} title={title} className="flex items-center space-x-1.5 rounded-full px-3 py-1 opacity-70 transition-opacity hover:opacity-100 bg-black/5">
                            <Icon className="h-4 w-4" /><span className="text-sm font-medium">{post.reactions?.[key] || 0}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    </Link>
  );
};

export default PostCard;