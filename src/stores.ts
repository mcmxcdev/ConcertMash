import { writable } from 'svelte/store';

export const storedToken = writable<string | null>(null);
export const storedUser = writable<
  globalThis.SpotifyApi.CurrentUsersProfileResponse | undefined
>();
