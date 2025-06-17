// This mock data simulates what would be in your database.
let mockLetters = [
  {
    _id: 'letter-1', type: 'future', status: 'scheduled',
    content: "Dear Future Me,\n\nI hope you're doing well! Right now, I'm feeling a bit anxious about the job interview tomorrow. Remember to breathe and trust your abilities. Don't forget why you started this journey.\n\nLove,\nPast You",
    mood: 2, // Corresponds to 'healing'
    target_date: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString(),
    created_at: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString(),
    opened_at: null, word_count: 50,
  },
  {
    _id: 'letter-2', type: 'future', status: 'scheduled',
    content: "Hello from the past! Just wanted to tell you that no matter how tough things get, you're resilient. This challenge you're facing today? You'll overcome it. Keep that spark alive.\n\nSincerely,\nYour Younger Self",
    mood: 3, // Corresponds to 'empowered'
    target_date: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(), // Ready to open
    created_at: new Date(new Date().setDate(new Date().getDate() - 60)).toISOString(),
    opened_at: null, word_count: 45,
  },
  {
    _id: 'letter-3', type: 'past', status: 'opened',
    content: "Dear 2023 Self,\n\nI wish I could tell you to worry less about what others think. Focus on your passions and trust your instincts. The hard work you're putting in now will pay off in unexpected ways. Enjoy the small moments.\n\nFrom,\nYour Future Self",
    mood: 1, // Corresponds to 'heartbroken'
    target_date: new Date('2023-07-15T12:00:00Z').toISOString(),
    created_at: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString(),
    opened_at: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString(), word_count: 65,
  },
];

const simulateDelay = (ms = 400) => new Promise(resolve => setTimeout(resolve, ms));

export const mockLetterApi = {
  async fetchLetters() {
    await simulateDelay();
    return JSON.parse(JSON.stringify(mockLetters)); // Return a deep copy
  },
  async saveLetter(letterData) {
    await simulateDelay();
    if (letterData._id) {
      // Update
      mockLetters = mockLetters.map(l => l._id === letterData._id ? { ...l, ...letterData } : l);
      return letterData;
    } else {
      // Create
      const newLetter = { _id: `letter-${Date.now()}`, ...letterData, status: 'scheduled', created_at: new Date().toISOString() };
      mockLetters.push(newLetter);
      return newLetter;
    }
  },
  async markLetterAsOpened(letterId) {
    await simulateDelay(200);
    let letterToUpdate = mockLetters.find(l => l._id === letterId);
    if (letterToUpdate) {
      letterToUpdate.status = 'opened';
      letterToUpdate.opened_at = new Date().toISOString();
      return { ...letterToUpdate };
    }
    throw new Error("Letter not found.");
  },
  async deleteLetter(letterId) {
    await simulateDelay();
    mockLetters = mockLetters.filter(l => l._id !== letterId);
    return { success: true };
  }
};