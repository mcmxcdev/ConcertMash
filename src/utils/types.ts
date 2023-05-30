export type SelectValues = { id: string; label: string; value: string };

export type FormFields = {
  playlistTitle: string;
  playlistDescription: string;
  playlistVisibility: 'private' | 'public';
  songsPerArtist: 'top10' | 'top10-and-most-recent-release' | 'all';
  albumType: 'album' | 'single ' | 'both';
  artists: SelectValues[];
  excludedSongTypes: (
    | 'live'
    | 'instrumentals'
    | 'commentary'
    | 'demo'
    | 'remix'
  )[];
};
