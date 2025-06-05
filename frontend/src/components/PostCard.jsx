import React from 'react';

const PostCard = ({ post }) => {
  const { title, content, imageUrl, likes } = post;

  return (
    <div
      className="rounded-2xl p-4 shadow-md transition-colors duration-300"
      style={{
        backgroundColor: 'var(--mood-bg)',
        color: 'var(--mood-text)',
        fontFamily: 'var(--mood-font)',
        border: '1px solid var(--mood-primary)',
      }}
    >
      <h2
        className="text-2xl font-bold mb-2"
        style={{
          color: 'var(--mood-primary)',
          fontFamily: 'var(--mood-font)',
        }}
      >
        {title}
      </h2>

      <p className="mb-4" style={{ color: 'var(--mood-text)' }}>
        {content}
      </p>

      {imageUrl && (
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-auto object-cover rounded-lg mb-4"
          style={{ border: '1px solid var(--mood-secondary)' }}
        />
      )}

      <p
        className="text-sm italic"
        style={{
          color: 'var(--mood-secondary)',
          fontStyle: 'italic',
        }}
      >
        Likes: {likes}
      </p>
    </div>
  );
};

export default PostCard;
