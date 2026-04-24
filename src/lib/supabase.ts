import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Type definitions
export interface PortfolioItem {
  id: string;
  title: string;
  category: 'vision' | 'experience' | 'achievement';
  description: string;
  image_url: string;
  video_url: string | null;
  is_representative: boolean;
  date: string | null;
  created_at: string;
}

export interface PortfolioMetadata {
  id: string;
  title: string;
  description: string | null;
  theme: 'white' | 'dark';
  created_at: string;
}