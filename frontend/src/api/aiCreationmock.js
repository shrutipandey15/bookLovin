const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let privateCreations = [
    { id: 'c1', prompt: 'a cat reading a book by a fireplace', imageUrl: '/src/assets/ai-art-sample.png' },
];

export const mockCreationsService = {

    generateAiImage: async (prompt) => {
        console.log(`MOCK AI: Generating image for prompt: "${prompt}"`);
        await delay(1500);
        return {
            imageUrl: '/src/assets/ai-art-sample.png'
        };
    },

    saveCreationToPrivateCollection: async (creationData) => {
        console.log("MOCK AI: Saving creation", creationData);
        await delay(300);
        const newCreation = {
            id: `c${privateCreations.length + 1}`,
            ...creationData
        };
        privateCreations = [newCreation, ...privateCreations];
        return newCreation;
    },

    getPrivateCreations: async () => {
        console.log("MOCK AI: Fetching private creations");
        await delay(500);
        return privateCreations;
    }
};