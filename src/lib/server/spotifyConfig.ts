const requireEnv = (name: string, value: string | undefined): string => {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

export const SPOTIFY_CLIENT_ID = requireEnv(
  'VITE_SPOTIFY_CLIENT_ID',
  import.meta.env.VITE_SPOTIFY_CLIENT_ID,
);
export const SPOTIFY_REDIRECT_URI = `${requireEnv('VITE_APP_BASE_URL', import.meta.env.VITE_APP_BASE_URL)}/auth/callback`;
