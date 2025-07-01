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
    if (confessions.length === 0) {
      dispatch(fetchConfessions());
    }
  }, [dispatch, confessions.length]);

  const renderContent = () => {
    if (status === "loading") {
      return (
        <p className="text-center text-white/70">
          Gathering echoes from the constellation...
        </p>
      );
    }
    if (status === "failed") {
      return (
        <p className="text-center text-red-400">
          The stars are not aligned. Could not fetch reflections.
        </p>
      );
    }

    return confessions.map((confession) => (
      <ConfessionCard
        key={confession._id}
        confession={confession}
        style={{
          top: `${15 + Math.random() * 65}%`,
          left: `${10 + Math.random() * 70}%`,
          maxWidth: "320px",
          animationDelay: `${Math.random() * 2}s`,
        }}
      />
    ));
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-gray-900">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-800 via-gray-900 to-black opacity-80"></div>

      <div className="relative h-full w-full p-8">{renderContent()}</div>

      <div className="absolute top-8 left-1/2 -translate-x-1/2 text-center pointer-events-none">
        <h1 className="text-3xl font-bold text-white font-fantasy tracking-wider">
          The Confession Wall
        </h1>
        <p className="text-white/60">
          Quiet thoughts, released into the ether.
        </p>
      </div>

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
