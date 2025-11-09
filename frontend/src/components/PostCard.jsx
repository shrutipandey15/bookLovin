import React from "react";
import { Link } from "react-router-dom";
import { User, MessageSquare } from "lucide-react";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from "react-responsive-carousel";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";
const backendRoot = apiUrl.split("/api/v1")[0];

const PostCard = ({ post }) => {
  const authorName = post.author?.penName || "Anonymous";

  return (
    <article className="rounded-2xl border border-secondary bg-background shadow-md backdrop-blur-md overflow-hidden">
      {post.imageUrls && post.imageUrls.length > 0 && (
        <div className="border-b border-secondary">
          <Carousel
            showThumbs={false}
            showStatus={false}
            showIndicators={post.imageUrls.length > 1}
            infiniteLoop={true}
            useKeyboardArrows={true}
          >
            {post.imageUrls.map((url, index) => (
              <div key={index} className="h-80">
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

      <div className="p-6">
        {/* Author Info */}
        <div className="flex items-center space-x-2 text-sm text-secondary mb-2">
          <User className="h-4 w-4" />
          <span>{authorName}</span>
        </div>

        {/* Post Title (links to single page) */}
        <Link to={`/posts/${post.uid}`} className="block">
          <h2 className="text-2xl font-bold text-primary hover:underline mb-3">
            {post.title}
          </h2>
        </Link>

        {/* Post Content */}
        <p className="text-text-primary mb-4 whitespace-pre-wrap line-clamp-3">
          {post.content}
        </p>

        {/* Footer with comments link */}
        <div className="border-t border-secondary pt-4">
          <Link
            to={`/posts/${post.uid}`}
            className="flex items-center gap-2 text-secondary hover:text-primary"
          >
            <MessageSquare className="h-5 w-5" />
            <span>View comments</span>
          </Link>
        </div>
      </div>
    </article>
  );
};

export default PostCard;