// This file represents the data that would normally live in your database.

export const mockConfessionsData = [
  {
    _id: 'conf1',
    content: "Sometimes I re-read a chapter of my favorite book just to feel safe again. It's like visiting an old friend.",
    moodKey: 'nostalgic',
    soulName: 'Wandering Reader',
    reactions: { hug: 0, star: 0, flower: 0 },
    createdAt: new Date('2025-06-17T12:00:00Z').toISOString(),
  },
  {
    _id: 'conf2',
    content: "I didn't give up today, even though every part of me wanted to. I'm proud of that.",
    moodKey: 'empowered',
    soulName: 'Quiet Ember',
    reactions: { hug: 0, star: 0, flower: 0 },
    createdAt: new Date('2025-06-17T14:30:00Z').toISOString(),
  },
  {
    _id: 'conf3',
    content: "Feeling a little lost in the noise of the world. Hoping for a moment of peace soon.",
    moodKey: 'lonely',
    soulName: 'Floating Seed',
    reactions: { hug: 0, star: 0, flower: 0 },
    createdAt: new Date('2025-06-17T15:00:00Z').toISOString(),
  },
  {
    _id: 'conf4',
    content: "The kindness of a stranger today reminded me that there's still so much good in the world.",
    moodKey: 'grateful',
    soulName: 'Silent Observer',
    reactions: { hug: 0, star: 0, flower: 0 },
    createdAt: new Date('2025-06-16T18:00:00Z').toISOString(),
  },
];