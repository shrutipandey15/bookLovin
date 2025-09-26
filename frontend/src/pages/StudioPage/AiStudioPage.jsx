import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { generateImage, saveCreation, clearGeneratedImage } from '@redux/creationsSlice';
import { Wand2, Sparkles, Save, ArrowLeft, Image as ImageIcon } from 'lucide-react';

const AIStudioPage = () => {
    const { bookId } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [prompt, setPrompt] = useState('A melancholic girl under a glass bell jar, surreal 1950s New York City skyline, distorted colors, style of an old photograph.');
    const { generatedImageUrl, status, error } = useSelector((state) => state.creations);

    const handleGenerate = () => {
        if (!prompt.trim()) return;
        dispatch(generateImage(prompt));
    };

    // MODIFIED: This function is now `async` to allow for `await`.
    const handleSaveCreation = async () => {
        if (!generatedImageUrl) return;
        const creationData = {
            imageUrl: generatedImageUrl,
            prompt,
            bookId,
        };

        // MODIFIED: We now `await` the dispatch. This pauses the function
        // until the save operation is fully complete.
        await dispatch(saveCreation(creationData));

        // These lines will now only run AFTER the save is finished.
        dispatch(clearGeneratedImage());
        navigate('/profile/MockUser');
    };

    return (
        <div className="mx-auto max-w-5xl p-8 font-body">
            <header className="mb-8">
                <Link to="/profile/MockUser" className="flex items-center space-x-2 text-secondary transition-colors hover:text-primary">
                    <ArrowLeft className="h-5 w-5" />
                    <span>Back to Profile</span>
                </Link>
                <div className="text-center mt-4">
                    <h1 className="text-4xl font-bold text-primary flex items-center justify-center gap-3"><Wand2 /> AI Art Studio</h1>
                    <p className="text-secondary">Bring your vision of the book to life.</p>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Side: Controls */}
                <div className="space-y-4">
                    <label htmlFor="prompt" className="block text-lg font-semibold text-text-primary">Describe your vision</label>
                    <textarea
                        id="prompt" value={prompt} onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g., A lone astronaut on a red desert planet..."
                        className="w-full h-48 resize-y rounded-lg border border-secondary bg-background/80 p-4 text-text-primary focus:border-primary focus:ring-primary"
                    />
                    <button onClick={handleGenerate} disabled={status === 'generating'} className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary py-3 text-lg font-bold text-text-contrast transition-opacity hover:opacity-90 disabled:opacity-50">
                        {status === 'generating' ? 'Generating...' : <><Sparkles size={20} /> Generate</>}
                    </button>
                </div>

                {/* Right Side: Image Display */}
                <div className="flex flex-col h-96 min-h-full items-center justify-center rounded-lg border-2 border-dashed border-secondary bg-background/50 p-4">
                    {status === 'generating' && <div className="text-center text-secondary animate-pulse"><Wand2 className="h-12 w-12 mx-auto mb-4" /><p>The AI is painting your vision...</p></div>}
                    {status === 'succeeded' && generatedImageUrl && (
                        <>
                            <img src={generatedImageUrl} alt="AI generated art" className="flex-1 w-full h-full object-contain" />
                            <button onClick={handleSaveCreation} className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary py-3 mt-4 text-lg font-bold text-text-contrast hover:opacity-90">
                                <Save size={20} /> Save to My Creations
                            </button>
                        </>
                    )}
                    {status === 'idle' && !generatedImageUrl && <div className="text-center text-secondary"><ImageIcon className="h-12 w-12 mx-auto mb-4" /><p>Your generated art will appear here.</p></div>}
                    {status === 'failed' && <div className="text-center text-red-500">{error || "Something went wrong."}</div>}
                </div>
            </div>
        </div>
    );
};

export default AIStudioPage;
