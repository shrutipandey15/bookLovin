import React from 'react';
import { Link } from 'react-router-dom';
import { useMood } from '@components/MoodContext';
import { useDashboardData } from '@hooks/useDashboardData';
import MoodSelectDropdown from '@pages/JournalPage/MoodSelectDropdown';
import { BookText, Mail, Feather, Zap, Flame } from 'lucide-react';
import { motion } from 'framer-motion';

const ActionCard = ({ to, icon, text }) => (
    <motion.div
        variants={{
            hidden: { opacity: 0, scale: 0.8 },
            visible: { opacity: 1, scale: 1 },
        }}
    >
        <Link
            to={to}
            className="flex h-28 w-28 flex-col items-center justify-center rounded-2xl border border-white/20 bg-white/10 p-4 text-center text-text-primary shadow-lg backdrop-blur-md transition-all duration-300 hover:border-white/40 hover:bg-white/20"
        >
            <div className="mb-2 text-primary">{icon}</div>
            <span className="text-sm font-semibold">{text}</span>
        </Link>
    </motion.div>
);

const SnippetCard = ({ icon, title, children }) => (
    <motion.div
        className="rounded-xl border border-white/20 bg-white/10 p-4 shadow-lg backdrop-blur-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
    >
        <div className="mb-2 flex items-center gap-2 text-sm text-text-primary/80">
            {icon}
            <span className="font-semibold">{title}</span>
        </div>
        <div className="text-base text-text-primary">{children}</div>
    </motion.div>
);

const HomePage = () => {
  const { mood, setMood } = useMood();
  const { user, stats, lastEntry, nextLetter, isLoading } = useDashboardData();

  if (isLoading) {
    return <div className="flex h-screen w-full items-center justify-center bg-background text-text-primary text-lg italic">Loading your realm...</div>;
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center p-8 font-body transition-colors duration-500">

      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <h1 className="text-4xl font-bold text-primary sm:text-5xl">
          Hi {user?.name || 'BookLovin'},
        </h1>
        <h2 className="mt-2 text-xl text-text-primary/80">
          how are you feeling today?
        </h2>
        <div className="mt-6 flex justify-center">
            <MoodSelectDropdown selectedMood={mood} onMoodChange={setMood} />
        </div>
      </motion.div>

      <motion.div
        className="my-12 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6"
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      >
        <ActionCard to="/journal" icon={<Feather size={28}/>} text="New Entry" />
        <ActionCard to="/letters" icon={<Mail size={28}/>} text="Letters" />
        <ActionCard to="/posts" icon={<BookText size={28}/>} text="Reflections" />
        <ActionCard to="/confessions" icon={<Zap size={28}/>} text="Confess" />
      </motion.div>

      <div className="w-full max-w-2xl space-y-4">
        {stats.streak > 0 && (
            <SnippetCard icon={<Flame className="text-orange-500" />} title="Writing Streak">
                You're on a <strong>{stats.streak}-day</strong> streak. Keep the flame alive!
            </SnippetCard>
        )}
        {nextLetter && (
            <SnippetCard icon={<Mail className="text-blue-500" />} title="From Your Past">
                A letter you wrote to yourself has arrived. <Link to="/letters" className="font-bold underline hover:text-primary">Open it now.</Link>
            </SnippetCard>
        )}
        {lastEntry && (
             <SnippetCard icon={<BookText className="text-green-500" />} title="Last Reflection">
                <p className="italic line-clamp-2">"{lastEntry.content}"</p>
            </SnippetCard>
        )}
      </div>
    </div>
  );
};

export default HomePage;
