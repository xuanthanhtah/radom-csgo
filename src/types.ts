export type Item = {
  id: string;
  name: string;
  image: string;
};

export type User = {
  id: string;
  name: string;
  image?: string;
  img?: string;
};

export type HistoryEntry = {
  // ISO timestamp string from DB
  created_at: string;
  // stored as the user's id in the Histories table
  userId: string;
  // whether this row is visible/active in the UI
  inactive?: boolean;
  // ISO timestamp string of last modification (optional)
  modify_date?: string;
};
