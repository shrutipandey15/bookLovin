import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchSinglePost,
  fetchCommentsForPost,
  addComment,
  deletePost,
  deleteComment,
} from "@redux/postsSlice";
import { fetchCurrentUser } from "@components/auth";
import {
  ArrowLeft,
  User,
  MessageSquare,
  Send,
  Trash2,
  Edit,
} from "lucide-react";
import ConfirmModal from "@components/ConfirmModal";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from "react-responsive-carousel";

const Comment = ({ comment, currentUserId, onCommentDelete }) => {
  const isAuthor = comment.authorId === currentUserId;
  return (
    <div className="flex items-start space-x-3 py-4">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary/20 text-secondary">
        <User className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-text-primary">
            {comment.author?.penName || "Anonymous"}
          </p>
          {isAuthor && (
            <button
              onClick={() => onCommentDelete(comment.uid)}
              className="text-secondary/50 hover:text-red-500"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
        <p className="text-base text-text-primary">{comment.content}</p>
      </div>
    </div>
  );
};

const CommentSection = ({ postId, commentsList, currentUserId }) => {
  const dispatch = useDispatch();
  const [newComment, setNewComment] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [commentToDeleteId, setCommentToDeleteId] = useState(null);

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    dispatch(
      addComment({
        postId,
        commentData: {
          content: newComment,
          postId: postId,
        },
      })
    );
    setNewComment("");
  };

  const confirmCommentDelete = (commentId) => {
    setCommentToDeleteId(commentId);
    setShowConfirmModal(true);
  };

  const handleCommentDelete = () => {
    if (!commentToDeleteId) return;
    dispatch(deleteComment({ postId, commentId: commentToDeleteId }));
    setShowConfirmModal(false);
    setCommentToDeleteId(null);
  };

  return (
    <div className="mt-12">
      <h2 className="mb-6 flex items-center space-x-2 text-2xl font-bold text-primary">
        <MessageSquare />
        <span>Reflections</span>
      </h2>

      <form
        onSubmit={handleCommentSubmit}
        className="mb-8 flex items-start space-x-3"
      >
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Share your reflection..."
          rows="2"
          className="flex-1 resize-y rounded-lg border border-secondary bg-background p-3 text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        <button
          type="submit"
          className="rounded-lg bg-primary p-3 text-text-contrast transition-opacity hover:opacity-90 disabled:opacity-50"
          disabled={!newComment.trim()}
        >
          <Send className="h-5 w-5" />
        </button>
      </form>

      <div className="divide-y divide-secondary/50">
        {commentsList.length > 0 ? (
          commentsList.map((comment) => (
            <Comment
              key={comment.uid}
              comment={comment}
              currentUserId={currentUserId}
              onCommentDelete={confirmCommentDelete}
            />
          ))
        ) : (
          <p className="py-8 text-center text-secondary">
            Be the first to share a reflection.
          </p>
        )}
      </div>

      <ConfirmModal
        isOpen={showConfirmModal}
        message="Are you sure you want to delete this comment? This action cannot be undone."
        onConfirm={handleCommentDelete}
        onCancel={() => setShowConfirmModal(false)}
      />
    </div>
  );
};

const SinglePostPage = () => {
  const { id: postId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const { currentPost, comments, status, error } = useSelector(
    (state) => state.posts
  );

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
    await dispatch(deletePost(postId));
    setShowConfirmModal(false);
    navigate("/posts");
  };

  const confirmPostDelete = () => {
    setShowConfirmModal(true);
  };

  if (status === "loading" || !currentPost || !currentUser) {
    return (
      <div className="py-16 text-center text-lg italic text-secondary">
        Loading reflection...
      </div>
    );
  }

  if (error || !currentPost) {
    return (
      <div className="py-16 text-center text-lg text-red-500">
        Could not load this reflection. It may have been removed.
      </div>
    );
  }

  const isAuthor = currentUser?.uid === currentPost.authorId;
  const postComments = comments[postId] || [];
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";
  const backendRoot = apiUrl.split("/api/v1")[0];

  return (
    <div className="mx-auto max-w-4xl p-4 font-body text-text-primary sm:p-6 lg:p-8">
      <div className="mb-8 flex items-center justify-between">
        <Link
          to="/posts"
          className="flex items-center space-x-2 text-secondary transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Reflections</span>
        </Link>
        {isAuthor && (
          <div className="flex items-center space-x-2">
            <Link
              to={`/posts/${postId}/edit`}
              className="rounded-lg border border-primary p-2 text-primary transition-colors hover:bg-primary/10"
            >
              <Edit className="h-5 w-5" />
            </Link>
            <button
              onClick={confirmPostDelete}
              className="rounded-lg border border-secondary p-2 text-secondary transition-colors hover:border-red-500 hover:text-red-500"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      <article className="rounded-2xl border border-secondary bg-background p-6 sm:p-8">
        <h1 className="mb-4 text-4xl font-bold text-primary">
          {currentPost.title}
        </h1>
        <div className="mb-6 flex items-center space-x-2 text-sm text-secondary">
          <User className="h-4 w-4" />
          <span>{currentPost.author?.penName || "Quiet Soul"}</span>
        </div>
        {currentPost.imageUrls && currentPost.imageUrls.length > 0 && (
          <div className="mb-8 rounded-lg overflow-hidden">
            <Carousel
              showThumbs={false}
              showStatus={false}
              infiniteLoop={true}
              useKeyboardArrows={true}
            >
              {currentPost.imageUrls.map((url, index) => (
                <div key={index} className="h-96">
                  {" "}
                  <img
                    src={`${backendRoot}${url}`}
                    alt={`Post image ${index + 1}`}
                    className="object-cover w-full h-full"
                  />
                </div>
              ))}
            </Carousel>
          </div>
        )}
        <div className="prose prose-lg dark:prose-invert max-w-none text-text-primary whitespace-pre-wrap">
          <p>{currentPost.content}</p>
        </div>
        <CommentSection
          postId={postId}
          commentsList={postComments}
          currentUserId={currentUser?.uid}
        />
      </article>
      <ConfirmModal
        isOpen={showConfirmModal}
        message="Are you sure you want to delete this post? This action cannot be undone."
        onConfirm={handleDeletePost}
        onCancel={() => setShowConfirmModal(false)}
      />
    </div>
  );
};

export default SinglePostPage;
