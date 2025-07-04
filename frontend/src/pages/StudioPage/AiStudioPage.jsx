import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { generateImage, clearImage } from '@redux/studioSlice';
import { Wand2, Sparkles, Download, ArrowLeft, Image as ImageIcon } from 'lucide-react';

const AIStudioPage = () => {
    const { bookId } = useParams(); // We get the bookId to provide context
    const dispatch = useDispatch();

    const [prompt, setPrompt] = useState('A melancholic girl under a glass bell jar, surreal 1950s New York City skyline, distorted colors, style of an old photograph.');
    const { generatedImageUrl, status, error } = useSelector((state) => state.aiStudio);

    const handleGenerate = () => {
        if (!prompt.trim()) return;
        dispatch(generateImage(prompt));
    };
    
    const handleClear = () => {
        dispatch(clearImage());
    };

    return (
        <div className="mx-auto max-w-5xl p-8 font-body">
            <header className="mb-8">
                <Link to="/profile/MockUser" className="flex items-center space-x-2 text-secondary transition-colors hover:text-primary">
                    <ArrowLeft className="h-5 w-5" />
                    <span>Back to Profile</span>
                </Link>
                <div className="text-center mt-4">
                    <h1 className="text-4xl font-bold text-primary flex items-center justify-center gap-3">
                        <Wand2 /> AI Art Studio
                    </h1>
                    <p className="text-secondary">Bring your vision of the book to life.</p>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Side: Controls */}
                <div className="space-y-4">
                    <label htmlFor="prompt" className="block text-lg font-semibold text-text-primary">
                        Describe your vision
                    </label>
                    <textarea
                        id="prompt"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g., A lone astronaut on a red desert planet, style of vintage sci-fi comics..."
                        className="w-full h-48 resize-y rounded-lg border border-secondary bg-background/80 p-4 text-text-primary focus:border-primary focus:ring-primary"
                    />
                    <button
                        onClick={handleGenerate}
                        disabled={status === 'generating'}
                        className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary py-3 text-lg font-bold text-text-contrast transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {status === 'generating' ? 'Generating...' : <><Sparkles size={20} /> Generate</>}
                    </button>
                    <button onClick={handleClear} className="w-full text-sm text-secondary hover:text-primary">Start Over</button>
                </div>

                {/* Right Side: Image Display */}
                <div className="flex h-96 min-h-full items-center justify-center rounded-lg border-2 border-dashed border-secondary bg-background/50 p-4">
                    {status === 'generating' && (
                        <div className="text-center text-secondary animate-pulse">
                            <Wand2 className="h-12 w-12 mx-auto mb-4" />
                            <p>The AI is painting your vision...</p>
                        </div>
                    )}
                    {status === 'succeeded' && generatedImageUrl && (
                        <div className="relative group w-full h-full">
                            <img src={generatedImageUrl} alt="AI generated art based on the user's prompt" className="w-full h-full object-contain" />
                            <a 
                                href={generatedImageUrl} 
                                download={`booklovin-art-${Date.now()}.png`}
                                className="absolute bottom-4 right-4 flex items-center gap-2 rounded-lg bg-black/50 px-3 py-2 text-white opacity-0 transition-opacity group-hover:opacity-100"
                            >
                                <Download size={16}/> Download
                            </a>
                        </div>
                    )}
                     {status === 'idle' && !generatedImageUrl && (
                        <div className="text-center text-secondary">
                            <ImageIcon className="h-12 w-12 mx-auto mb-4" />
                            <p>Your generated art will appear here.</p>
                        </div>
                    )}
                     {status === 'failed' && (
                        <div className="text-center text-red-500">{error || "Something went wrong."}</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AIStudioPage;