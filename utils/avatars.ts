// Using DiceBear for fun, deterministic avatars based on seeds.
// The 'bottts-neutral' style provides pleasant, cartoonish robot avatars.
const seeds = ['Milo', 'Luna', 'Leo', 'Zoe', 'Max', 'Ruby', 'Oliver', 'Chloe'];
export const avatars = seeds.map(seed => `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${seed}&radius=50`);
