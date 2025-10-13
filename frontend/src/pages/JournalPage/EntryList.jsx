import React from 'react';
import EntryCard from './EntryCard';

const EntryList = ({ entries,onEdit, selectedEntry, onSelectEntry, onDelete, onToggleFavorite }) => {
  if (!entries || entries.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        No entries yet. Start writing!
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <ul className="space-y-2 p-2">
        {entries.map((entry) => (
          <li key={entry.uid}>
            <EntryCard
              entry={entry}
              onEdit={onEdit}
              isSelected={selectedEntry?.uid === entry.uid}
              onSelect={() => onSelectEntry(entry)}
              onDelete={() => onDelete(entry.uid)}
              onToggleFavorite={onToggleFavorite}

            />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EntryList;
