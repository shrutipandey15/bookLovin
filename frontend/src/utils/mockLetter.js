// Using snake_case for the raw data to simulate a database/API response
let mockLetters = [
  {
    _id: 'letter-1',
    type: 'future',
    content: "Dear Future Me,\n\nI hope you're doing well! Right now, I'm feeling a bit anxious about the job interview tomorrow. Remember to breathe and trust your abilities. Don't forget why you started this journey.\n\nLove,\nPast You",
    mood: 2, // Empowered
    target_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
    writing_time: 120,
    word_count: 50,
    status: 'scheduled',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    opened_at: null,
  },
  {
    _id: 'letter-2',
    type: 'future',
    content: "Hello from the past! Just wanted to tell you that no matter how tough things get, you're resilient. This challenge you're facing today? You'll overcome it. Keep that spark alive.\n\nSincerely,\nYour Younger Self",
    mood: 3, // Healing
    target_date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    writing_time: 90,
    word_count: 45,
    status: 'scheduled',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString(),
    opened_at: null,
  },
  {
    _id: 'letter-3',
    type: 'past',
    content: "Dear 2023 Self,\n\nI wish I could tell you to worry less about what others think. Focus on your passions and trust your instincts. The hard work you're putting in now will pay off in unexpected ways. Enjoy the small moments.\n\nFrom,\nYour Future Self",
    mood: 0, // Heartbroken
    target_date: new Date('2023-07-15T12:00:00Z').toISOString(),
    writing_time: 150,
    word_count: 65,
    status: 'completed',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    opened_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
  },
  {
    _id: 'letter-4',
    type: 'future',
    content: "Remember that feeling of excitement when you first thought of building this? Hold onto that. Challenges will come, but so will immense satisfaction. Keep dreaming big!",
    mood: 2, // Empowered
    target_date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
    writing_time: 70,
    word_count: 38,
    status: 'opened',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90).toISOString(),
    opened_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
  }
];

const simulateDelay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

export const mockLetterApi = {
  async fetchLetters() {
    console.log('Mock API: Fetching letters...');
    await simulateDelay();
    return JSON.parse(JSON.stringify(mockLetters)); // Return a deep copy
  },

  async saveLetter(letterData) {
    console.log('Mock API: Saving letter...', letterData);
    await simulateDelay();
    // Accepts camelCase from the client and saves as snake_case internally
    if (letterData._id) {
      // Update existing
      let updatedLetter = null;
      mockLetters = mockLetters.map(l => {
        if (l._id === letterData._id) {
          updatedLetter = { ...l, ...letterData, updatedAt: new Date().toISOString() };
          return updatedLetter;
        }
        return l;
      });
      return updatedLetter;
    } else {
      // Create new
      const newId = `letter-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newLetter = {
        _id: newId,
        type: letterData.type,
        content: letterData.content,
        mood: letterData.mood,
        target_date: letterData.targetDate,
        writing_time: letterData.writingTime,
        word_count: letterData.wordCount,
        status: letterData.type === 'future' ? 'scheduled' : 'completed',
        created_at: new Date().toISOString(),
        opened_at: letterData.type === 'past' ? new Date().toISOString() : null,
      };
      mockLetters.push(newLetter);
      return newLetter;
    }
  },

  async markLetterAsOpened(letterId) {
    console.log('Mock API: Marking letter as opened...', letterId);
    await simulateDelay();
    let updatedLetter = null;
    mockLetters = mockLetters.map(l => {
      if (l._id === letterId && l.type === 'future' && l.status === 'scheduled') {
        updatedLetter = { ...l, status: 'opened', opened_at: new Date().toISOString() };
        return updatedLetter;
      }
      return l;
    });
    if (!updatedLetter) {
      throw new Error("Letter not found or not eligible to be opened.");
    }
    return updatedLetter;
  },

  async deleteLetter(letterId) {
    console.log('Mock API: Deleting letter...', letterId);
    await simulateDelay();
    const initialLength = mockLetters.length;
    mockLetters = mockLetters.filter(l => l._id !== letterId);
    if (mockLetters.length === initialLength) {
      throw new Error("Letter not found for deletion.");
    }
    return { success: true };
  }
};
