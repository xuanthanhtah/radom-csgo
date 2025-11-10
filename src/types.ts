export type Item = {
  id: string;
  name: string;
  image: string;
};

export type User = {
  id: string;
  name: string;
  image?: string;
  // Supabase returns the image URL in the `img` column for this project
  img?: string;
};

export type HistoryEntry = {
  // ISO timestamp string from DB
  created_at: string;
  // stored as the user's id in the Histories table
  userId: string;
};
