import React from 'react';

const PostCard = ({ post }) => {
  const { title, content, imageUrl, likes } = post;

  return (
    <div className="bg-coffee-card dark:bg-dragon-card rounded-2xl p-4 shadow-md">
      <h2 className="text-2xl font-bold text-coffee-heading dark:text-dragon-gold mb-2">
        {title}
      </h2>

      <p className="text-coffee-text dark:text-dragon-text mb-4">{content}</p>

      {imageUrl && (
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-auto object-cover rounded-lg mb-4"
        />
      )}

      <p className="text-sm text-coffee-subtext dark:text-dragon-subtext italic">
        Likes: {likes}
      </p>
    </div>
  );
};

export default PostCard;
