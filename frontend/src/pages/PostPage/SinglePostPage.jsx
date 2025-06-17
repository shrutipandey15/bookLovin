import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSinglePost, fetchCommentsForPost, addComment, deletePost, deleteComment } from '@redux/postsSlice';
import { fetchCurrentUser } from '@components/auth'; // Import the user fetching utility
import { ArrowLeft, User, MessageSquare, Send, Trash2, Edit } from 'lucide-react';

// A sub-component for a single comment
const Comment = ({ comment, currentUserId, onCommentDelete }) => {
  // This logic is now correct because currentUserId will be passed down properly.
  const isAuthor = comment.authorId === currentUserId;
  return (
    <div className="flex items-start space-x-3 py-4">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary/20 text-secondary">
        <User className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-text-primary">{comment.author?.penName || 'Anonymous'}</p>
          {isAuthor && (
            <button onClick={() => onCommentDelete(comment.uid)} className="text-secondary/50 hover:text-red-500">
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
        <p className="text-base text-text-primary">{comment.content}</p>
      </div>
    </div>
  );
};


// A sub-component for the entire comments section
const CommentSection = ({ postId, commentsList, currentUserId }) => {
  const dispatch = useDispatch();
  const [newComment, setNewComment] = useState('');

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    // The backend's `add_comment_to_post` uses the user from the token,
    // so we only need to send the content.
    dispatch(addComment({ postId, commentData: { content: newComment } }));
    setNewComment('');
  };
  
  const handleCommentDelete = (commentId) => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      dispatch(deleteComment({ postId, commentId }));
    }
  };

  return (
    <div className="mt-12">
      <h2 className="mb-6 flex items-center space-x-2 text-2xl font-bold text-primary">
        <MessageSquare />
        <span>Reflections</span>
      </h2>
      
      {/* Add Comment Form */}
      <form onSubmit={handleCommentSubmit} className="mb-8 flex items-start space-x-3">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Share your reflection..."
          rows="2"
          className="flex-1 resize-y rounded-lg border border-secondary bg-background p-3 text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        <button type="submit" className="rounded-lg bg-primary p-3 text-text-contrast transition-opacity hover:opacity-90 disabled:opacity-50" disabled={!newComment.trim()}>
          <Send className="h-5 w-5" />
        </button>
      </form>
      
      {/* Comments List */}
      <div className="divide-y divide-secondary/50">
        {commentsList.length > 0 ? (
          commentsList.map(comment => (
            <Comment key={comment.uid} comment={comment} currentUserId={currentUserId} onCommentDelete={handleCommentDelete} />
          ))
        ) : (
          <p className="py-8 text-center text-secondary">Be the first to share a reflection.</p>
        )}
      </div>
    </div>
  );
};


// The main page component
const SinglePostPage = () => {
  const { id: postId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // FIX 1: Add local state to hold the current user's data
  const [currentUser, setCurrentUser] = useState(null);
  
  // Redux state for posts remains the same
  const { currentPost, comments, status, error } = useSelector((state) => state.posts);
  
  // FIX 2: Add a useEffect to fetch the current user when the component mounts
  useEffect(() => {
    const getUser = async () => {
        try {
            const user = await fetchCurrentUser();
            setCurrentUser(user);
        } catch (e) {
            console.error("No logged in user found", e);
        }
    };
    getUser();
  }, []);
  
  useEffect(() => {
    if (postId) {
      dispatch(fetchSinglePost(postId));
      dispatch(fetchCommentsForPost(postId));
    }
  }, [dispatch, postId]);

  const handleDeletePost = async () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
        await dispatch(deletePost(postId));
        navigate('/posts');
    }
  };

  if (status === 'loading' && !currentPost) {
    return <div className="py-16 text-center text-lg italic text-secondary">Loading reflection...</div>;
  }
  
  if (error || !currentPost) {
    return <div className="py-16 text-center text-lg text-red-500">Could not load this reflection. It may have been removed.</div>;
  }
  
  // FIX 3: Use the local 'currentUser' state for the authorization check
  const isAuthor = currentUser?.uid === currentPost.authorId;
  const postComments = comments[postId] || [];

  return (
    <div className="mx-auto max-w-4xl p-4 font-body text-text-primary sm:p-6 lg:p-8">
      {/* Back and Edit Buttons */}
      <div className="mb-8 flex items-center justify-between">
        <Link to="/posts" className="flex items-center space-x-2 text-secondary transition-colors hover:text-primary">
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Reflections</span>
        </Link>
        {isAuthor && (
            <div className="flex items-center space-x-2">
                <Link to={`/posts/${postId}/edit`} className="rounded-lg border border-primary p-2 text-primary transition-colors hover:bg-primary/10">
                    <Edit className="h-5 w-5" />
                </Link>
                <button onClick={handleDeletePost} className="rounded-lg border border-secondary p-2 text-secondary transition-colors hover:border-red-500 hover:text-red-500">
                    <Trash2 className="h-5 w-5" />
                </button>
            </div>
        )}
      </div>

      {/* Post Content */}
      <article className="rounded-2xl border border-secondary bg-background p-6 sm:p-8">
        <h1 className="mb-4 text-4xl font-bold text-primary">{currentPost.title}</h1>
        <div className="mb-6 flex items-center space-x-2 text-sm text-secondary">
          <User className="h-4 w-4" />
          <span>{currentPost.author?.penName || 'Quiet Soul'}</span>
        </div>
        
        {currentPost.imageUrl && (
          <img
            src={currentPost.imageUrl}
            alt={currentPost.title}
            className="mb-8 aspect-video w-full rounded-lg object-cover"
          />
        )}
        
        <div className="prose prose-lg dark:prose-invert max-w-none text-text-primary whitespace-pre-wrap">
          <p>{currentPost.content}</p>
        </div>

        {/* FIX 4: Pass the local 'currentUser.uid' to the CommentSection */}
        <CommentSection postId={postId} commentsList={postComments} currentUserId={currentUser?.uid} />
      </article>
    </div>
  );
};

export default SinglePostPage;