import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// ─── Tipos base alineados con el schema de Supabase ───────────

export type Profile = {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  preferred_language: string;
  preferred_currency: string;
  created_at: string;
  updated_at: string;
};

export type Destination = {
  id: string;
  slug: string;
  name: string;
  short_description: string | null;
  description: string | null;
  category: string;
  city: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  price: number;
  price_label: string | null;
  currency: string;
  rating: number;
  review_count: number;
  duration_hours: number | null;
  max_capacity: number | null;
  is_active: boolean;
  is_featured: boolean;
};

export type DestinationImage = {
  id: string;
  destination_id: string;
  storage_path: string;
  url: string | null;
  alt_text: string | null;
  sort_order: number;
};

export type Restaurant = {
  id: string;
  destination_id: string | null;
  name: string;
  description: string | null;
  cuisine_type: string[];
  price_range: number | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  website: string | null;
  google_maps_url: string | null;
  rating: number | null;
};

export type Booking = {
  id: string;
  user_id: string;
  destination_id: string;
  booking_date: string;
  num_people: number;
  unit_price: number;
  total_price: number;
  currency: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  notes: string | null;
  created_at: string;
  updated_at: string;
  // join
  destination?: Destination;
};

export type Review = {
  id: string;
  user_id: string;
  destination_id: string;
  rating: number;
  title: string | null;
  comment: string;
  is_published: boolean;
  created_at: string;
  // join
  profile?: Pick<Profile, "full_name" | "avatar_url">;
  review_photos?: ReviewPhoto[];
};

export type ReviewPhoto = {
  id: string;
  review_id: string;
  storage_path: string;
  url: string | null;
  sort_order: number;
};

export type Favorite = {
  user_id: string;
  destination_id: string;
  created_at: string;
  destination?: Destination;
};
