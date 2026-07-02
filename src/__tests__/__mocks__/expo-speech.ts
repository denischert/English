export const speak = jest.fn();
export const stop = jest.fn();
export const getAvailableVoicesAsync = jest.fn().mockResolvedValue([]);
export enum VoiceQuality { Default = "Default", Enhanced = "Enhanced" }
