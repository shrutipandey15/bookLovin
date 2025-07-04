import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserProfile } from "@redux/profileSlice";
import { User, BookOpen, MessageSquare, Loader, Image } from "lucide-react";
import PostCard from "@components/PostCard";

const ShelfBookCard = ({ shelfItem }) => (
  <div className="text-center">
    <img
      src={shelfItem.book.cover_image_url}
      alt={shelfItem.book.title}
      className="w-full h-48 object-cover rounded-md shadow-lg transition-transform hover:scale-105"
    />
    <Link
      to={`/studio/create/${shelfItem.book.googleBooksId}`}
      className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-md"
    >
      <Image className="h-8 w-8 text-white mb-2" />
      <span className="font-semibold text-white text-sm">Create Graphic</span>
    </Link>
    <h3 className="mt-2 font-semibold text-sm text-text-primary truncate">
      {shelfItem.book.title}
    </h3>
    <p className="text-xs text-secondary">{shelfItem.book.author}</p>
  </div>
);

const UserProfilePage = () => {
  const { username } = useParams();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("shelves");

  const {
    data: profile,
    status,
    error,
  } = useSelector((state) => state.profile);

  useEffect(() => {
    if (username) {
      dispatch(fetchUserProfile(username));
    }
  }, [dispatch, username]);

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader className="animate-spin h-10 w-10 text-primary" />
      </div>
    );
  }

  if (status === "failed" || !profile) {
    return (
      <div className="text-center text-red-500 py-10">
        Could not load profile. {error}
      </div>
    );
  }

  const { user, shelves, posts } = profile;

  const ShelvesContent = () => {
    const wantToRead = shelves.filter((s) => s.status === "want_to_read");
    const reading = shelves.filter((s) => s.status === "reading");
    const read = shelves.filter((s) => s.status === "read");

    return (
      <div className="space-y-10">
        {reading.length > 0 && (
          <div>
            <h3 className="text-xl font-bold text-primary mb-4">
              Currently Reading
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
              {reading.map((item) => (
                <ShelfBookCard key={item.id} shelfItem={item} />
              ))}
            </div>
          </div>
        )}
        {read.length > 0 && (
          <div>
            <h3 className="text-xl font-bold text-primary mb-4">Read</h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
              {read.map((item) => (
                <ShelfBookCard key={item.id} shelfItem={item} />
              ))}
            </div>
          </div>
        )}
        {wantToRead.length > 0 && (
          <div>
            <h3 className="text-xl font-bold text-primary mb-4">
              Want to Read
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
              {wantToRead.map((item) => (
                <ShelfBookCard key={item.id} shelfItem={item} />
              ))}
            </div>
          </div>
        )}
        {shelves.length === 0 && (
          <p className="text-center text-secondary py-10">
            This bookshelf is empty.
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 bg-background font-body">
      <header className="mb-10 flex flex-col items-center text-center">
        <div className="w-28 h-28 rounded-full bg-primary/20 flex items-center justify-center mb-4">
          <User className="w-16 h-16 text-primary" />
        </div>
        <h1 className="text-5xl font-bold text-primary">{user.username}</h1>
      </header>

      <div className="mb-8 flex justify-center border-b border-secondary">
        <button
          onClick={() => setActiveTab("shelves")}
          className={`px-6 py-3 text-sm font-medium transition-colors flex items-center gap-2 ${
            activeTab === "shelves"
              ? "border-b-2 border-primary text-primary"
              : "text-secondary hover:text-primary"
          }`}
        >
          <BookOpen size={18} /> Bookshelves ({shelves.length})
        </button>
        <button
          onClick={() => setActiveTab("reflections")}
          className={`px-6 py-3 text-sm font-medium transition-colors flex items-center gap-2 ${
            activeTab === "reflections"
              ? "border-b-2 border-primary text-primary"
              : "text-secondary hover:text-primary"
          }`}
        >
          <MessageSquare size={18} /> Reflections ({posts.length})
        </button>
      </div>

      <div>
        {activeTab === "shelves" && <ShelvesContent />}
        {activeTab === "reflections" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.length > 0 ? (
              posts.map((p) => <PostCard key={p.uid} post={p} />)
            ) : (
              <p className="col-span-full text-center text-secondary py-10">
                No reflections shared yet.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfilePage;
