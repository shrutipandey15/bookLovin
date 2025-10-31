import { Mail, Lock, Unlock } from "lucide-react";
import { LetterType } from "@constants/letterType";

export const LetterViewer = ({ letter, onMarkAsOpened }) => {
  if (!letter) {
    return <div className="text-center text-secondary">Loading letter...</div>;
  }

  const isFuture = letter.type === LetterType.FUTURE;
  const isScheduled = letter.status === "scheduled";
  const isReadyToOpen =
    isFuture && isScheduled && new Date(letter.targetDate) <= new Date();

  if (isReadyToOpen && onMarkAsOpened) {
    onMarkAsOpened(letter.uid);
  }

  const isLocked = isFuture && isScheduled && !isReadyToOpen;

  const formatDate = (dateString) => {
    console.log("LetterViewer formatDate input:", dateString, typeof dateString);
    const date = new Date(dateString);
    console.log("LetterViewer Date object:", date);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };


  const letterStyle = {
    fontFamily: "'Lora', serif",
    fontSize: "1.1rem",
    lineHeight: "2.2rem",
    color: "#3C3633",
  };

  return (
    <article className="h-full flex flex-col rounded-2xl border border-secondary bg-background p-8 shadow-lg">
      <header className="mb-6 border-b border-border-color pb-6">
        <h1 className="text-3xl font-bold font-heading text-primary">
          {isFuture
            ? "A Letter to My Future Self"
            : "A Memory From My Past Self"}
        </h1>
        <p className="mt-2 text-sm text-secondary">
          {isFuture
            ? `Written on ${formatDate(letter.created_at)}`
            : `Memory from ${formatDate(letter.targetDate)}`}
        </p>
      </header>

      {isLocked ? (
        <div className="flex-grow flex flex-col items-center justify-center text-center text-secondary">
          <Lock className="h-24 w-24 opacity-50 mb-4" />
          <h2 className="text-xl font-semibold text-text-primary">
            This letter is sealed.
          </h2>
          <p>It will be delivered to you on</p>
          <p className="text-lg font-bold text-primary mt-1">
            {formatDate(letter.targetDate)}
          </p>
        </div>
      ) : (
        <>
          <div className="prose prose-lg max-w-none text-text-primary font-body flex-grow overflow-y-auto">
            <p className="whitespace-pre-wrap" style={letterStyle}>
              {letter.content}
            </p>
          </div>

          <footer className="mt-8 border-t border-secondary pt-6">
            <div className="flex items-center justify-between text-sm text-secondary">
              <div>
                <p>{letter.wordCount} words</p>
                {isFuture && (
                  <p className="flex items-center gap-1">
                    <Unlock size={14} /> Delivered on{" "}
                    {formatDate(letter.targetDate)}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p
                  className="font-medium text-text-primary italic"
                  style={{ fontFamily: "'Lora', serif" }}
                >
                  {isFuture
                    ? "Sincerely, Your Past Self"
                    : "From, Your Past Self"}
                </p>
              </div>
            </div>
          </footer>
        </>
      )}
    </article>
  );
};
