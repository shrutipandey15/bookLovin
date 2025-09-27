import React from 'react';
import { Link } from 'react-router-dom';
import { useDashboardData } from '@hooks/useDashboardData';
import { Plus, BookOpen, Heart, Wand2, Feather } from 'lucide-react';
import EntryCard from './JournalPage/EntryCard';

const HomePage = () => {
  const { user, lastEntry, isLoading } = useDashboardData();

  if (isLoading) {
    return <div className="text-center p-12">Loading sanctuary...</div>;
  }

  return (
    <div className="p-8 md:p-12">
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="font-heading text-4xl text-text-primary font-bold">Welcome back, {user?.name || 'Reader'}</h1>
          <p className="text-text-secondary mt-1">Your literary sanctuary awaits</p>
        </div>
        <Link to="/journal/new" className="hidden sm:flex items-center gap-2 bg-primary text-text-contrast px-4 py-2 rounded-lg shadow-sm hover:opacity-90 transition-opacity">
          <Plus size={16} />
          <span className="font-semibold text-sm">New Entry</span>
        </Link>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Link to="/journal" className="bg-card-background border border-border-color p-6 rounded-xl hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-full"><Feather className="text-primary" size={20}/></div>
                <span className="font-heading font-semibold text-text-primary">Write Entry</span>
            </div>
          </Link>
          <Link to="/books/search" className="bg-card-background border border-border-color p-6 rounded-xl hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-full"><BookOpen className="text-primary" size={20}/></div>
                <span className="font-heading font-semibold text-text-primary">Log Book</span>
            </div>
          </Link>
          <Link to="/confessions" className="bg-card-background border border-border-color p-6 rounded-xl hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-full"><Heart className="text-primary" size={20}/></div>
                <span className="font-heading font-semibold text-text-primary">Browse Confessions</span>
            </div>
          </Link>
          <Link to="/studio/create/some-book-id" className="bg-card-background border border-border-color p-6 rounded-xl hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-full"><Wand2 className="text-primary" size={20}/></div>
                <span className="font-heading font-semibold text-text-primary">Create Art</span>
            </div>
          </Link>
      </div>
      
      <div>
        <div className="flex justify-between items-center mb-4">
            <h2 className="font-heading text-3xl text-text-primary font-bold">Recent Reflections</h2>
            <Link to="/journal" className="font-semibold text-sm text-primary hover:underline">View all entries</Link>
        </div>
        <div className="space-y-4">
            {lastEntry ? (
                <EntryCard entry={lastEntry} onEdit={() => {}} onDelete={() => {}} onToggleFavorite={() => {}} />
            ) : (
                <div className="text-center bg-card-background/50 border border-dashed border-border-color p-12 rounded-xl">
                    <p className="text-text-secondary">No recent reflections to show.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;