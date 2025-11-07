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
