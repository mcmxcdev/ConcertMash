import { writable } from 'svelte/store';

export const isDev = writable(import.meta.env.MODE === 'development');
export const storedToken = writable<string | null>(null);
export const storedUser = writable<
  globalThis.SpotifyApi.CurrentUsersProfileResponse | undefined
>();
