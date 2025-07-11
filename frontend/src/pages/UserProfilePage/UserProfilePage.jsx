import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserProfile } from "@redux/profileSlice";
import { fetchPrivateCreations } from "@redux/creationsSlice";
import { createPost } from "@redux/postsSlice";
import { User, BookOpen, MessageSquare, Loader, Image, Wand2, X } from "lucide-react";
import PostCard from "@components/PostCard";

const PostCreationModal = ({ creation, onClose, onShare }) => {
    const [caption, setCaption] = useState('');
    const handleShare = () => {
        onShare(caption);
        onClose();
    };
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-background rounded-2xl shadow-xl max-w-lg w-full p-6 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-secondary hover:text-primary"><X/></button>
                <h2 className="text-2xl font-bold text-primary mb-4">Share your Vision</h2>
                <img src={creation.imageUrl} alt={creation.prompt} className="w-full h-64 object-contain rounded-lg mb-4 bg-black/20" />
                <textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Add a caption to your post..."
                    className="w-full h-24 p-2 rounded-md bg-secondary/10 border border-secondary text-text-primary"
                />
                <button onClick={handleShare} disabled={!caption.trim()} className="w-full mt-4 py-3 rounded-lg bg-primary text-text-contrast font-bold disabled:opacity-50">Share Post</button>
            </div>
        </div>
    );
};

const PrivateCreationCard = ({ creation, onPost }) => (
    <div className="relative group">
        <img src={creation.imageUrl} alt={creation.prompt} className="w-full h-48 object-cover rounded-md" />
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
            <button onClick={() => onPost(creation)} className="px-4 py-2 rounded-lg bg-primary text-text-contrast font-semibold">Post...</button>
        </div>
    </div>
);

const ShelfBookCard = ({ shelfItem }) => (
    <div className="text-center group relative">
        <img src={shelfItem.book.cover_image_url} alt={shelfItem.book.title} className="w-full h-48 object-cover rounded-md shadow-lg" />
        <Link to={`/studio/create/${shelfItem.book.googleBooksId}`} className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
            <Wand2 className="h-8 w-8 text-white mb-2" />
            <span className="font-semibold text-white text-sm">Create Vision</span>
        </Link>
        <h3 className="mt-2 font-semibold text-sm text-text-primary truncate">{shelfItem.book.title}</h3>
        <p className="text-xs text-secondary">{shelfItem.book.author}</p>
    </div>
);


const UserProfilePage = () => {
    const { username } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("creations");
    const [isPostModalOpen, setIsPostModalOpen] = useState(false);
    const [creationToPost, setCreationToPost] = useState(null);

    const { data: profile, status, error } = useSelector((state) => state.profile);
    const { privateCreations } = useSelector((state) => state.creations);

    useEffect(() => {
        if (username) {
            dispatch(fetchUserProfile(username));
            dispatch(fetchPrivateCreations());
        }
    }, [dispatch, username]);
    
    const handleOpenPostModal = (creation) => {
        setCreationToPost(creation);
        setIsPostModalOpen(true);
    };

    const handleSharePost = (captionText) => {
        if (!creationToPost) return;
        const newPost = {
            caption_text: captionText,
            mediaUrl: creationToPost.imageUrl,
            bookId: creationToPost.bookId,
            moodKey: 'empowered',
        };
        dispatch(createPost(newPost));
        navigate('/feed'); // Navigate to the public feed after posting
    };

    if (status === 'loading') {
        return <div className="flex h-screen items-center justify-center"><Loader className="animate-spin h-10 w-10 text-primary" /></div>;
    }

    if (status === 'failed' || !profile) {
        return <div className="text-center text-red-500 py-10">Could not load profile. {error}</div>;
    }
    
    const { user, shelves, posts } = profile;

    return (
        <>
            {isPostModalOpen && <PostCreationModal creation={creationToPost} onClose={() => setIsPostModalOpen(false)} onShare={handleSharePost} />}
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 font-body">
                <header className="mb-10 flex flex-col items-center text-center">
                    <div className="w-28 h-28 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                        <User className="w-16 h-16 text-primary" />
                    </div>
                    <h1 className="text-5xl font-bold text-primary">{user.username}</h1>
                </header>

                <div className="mb-8 flex justify-center border-b border-secondary">
                    <button onClick={() => setActiveTab("creations")} className={`px-6 py-3 text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === "creations" ? "border-b-2 border-primary text-primary" : "text-secondary hover:text-primary"}`}>
                        <Wand2 size={18} /> My Creations ({privateCreations.length})
                    </button>
                    <button onClick={() => setActiveTab("posts")} className={`px-6 py-3 text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === "posts" ? "border-b-2 border-primary text-primary" : "text-secondary hover:text-primary"}`}>
                        <MessageSquare size={18} /> Showcase ({posts.length})
                    </button>
                    <button onClick={() => setActiveTab("shelves")} className={`px-6 py-3 text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === "shelves" ? "border-b-2 border-primary text-primary" : "text-secondary hover:text-primary"}`}>
                        <BookOpen size={18} /> Bookshelves ({shelves.length})
                    </button>
                </div>

                <div>
                    {activeTab === 'creations' && (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {privateCreations.length > 0 ? (
                                privateCreations.map((c) => <PrivateCreationCard key={c.id} creation={c} onPost={handleOpenPostModal} />)
                            ) : (
                                <p className="col-span-full text-center text-secondary py-10">Your generated art will be saved here.</p>
                            )}
                        </div>
                    )}
                    {activeTab === 'posts' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {posts.length > 0 ? (
                                posts.map((p) => <PostCard key={p.uid} post={p} />)
                            ) : (
                                <p className="col-span-full text-center text-secondary py-10">Shared posts will appear here.</p>
                            )}
                        </div>
                    )}
                    {activeTab === 'shelves' && (
                         <div className="space-y-10">
                            {shelves.filter(s => s.status === 'reading').length > 0 && <div><h3 className="text-xl font-bold text-primary mb-4">Currently Reading</h3><div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">{shelves.filter(s => s.status === 'reading').map(item => <ShelfBookCard key={item.id} shelfItem={item} />)}</div></div>}
                            {shelves.filter(s => s.status === 'read').length > 0 && <div><h3 className="text-xl font-bold text-primary mb-4">Read</h3><div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">{shelves.filter(s => s.status === 'read').map(item => <ShelfBookCard key={item.id} shelfItem={item} />)}</div></div>}
                            {shelves.filter(s => s.status === 'want_to_read').length > 0 && <div><h3 className="text-xl font-bold text-primary mb-4">Want to Read</h3><div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">{shelves.filter(s => s.status === 'want_to_read').map(item => <ShelfBookCard key={item.id} shelfItem={item} />)}</div></div>}
                            {shelves.length === 0 && <p className="text-center text-secondary py-10">This bookshelf is empty.</p>}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default UserProfilePage;