import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchConfessions } from "@redux/confessionSlice";
import ConfessionCard from "@pages/ConfessionPage/ConfessionCard";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";

const ConfessionWallPage = () => {
  const dispatch = useDispatch();
  const { items: confessions, status } = useSelector(
    (state) => state.confessions
  );

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchConfessions());
    }
  }, [dispatch, status]);

  const renderContent = () => {
    if (status === "loading") {
      return (
        <p className="text-center text-text-secondary py-10">
          Gathering echoes from the constellation...
        </p>
      );
    }
    if (status === "failed") {
      return (
        <p className="text-center text-red-500 py-10">
          The stars are not aligned. Could not fetch reflections.
        </p>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {confessions.map((confession) => (
          <ConfessionCard
            key={confession._id}
            confession={confession}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-primary font-heading tracking-wider">
          The Confession Wall
        </h1>
        <p className="text-text-secondary mt-2">
          Quiet thoughts, released into the ether.
        </p>
      </header>

      {renderContent()}

      <Link
        to="/confessions/new"
        className="fixed bottom-8 right-8 z-20 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-text-contrast shadow-lg transition-transform hover:scale-110"
        aria-label="Write a new confession"
      >
        <Plus className="h-8 w-8" />
      </Link>
    </div>
  );
};

export default ConfessionWallPage;