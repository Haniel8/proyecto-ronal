import { supabase, Destination, DestinationImage, Restaurant, Review } from "./supabase";

// ─── DESTINOS ─────────────────────────────────────────────────

/** Obtiene todos los destinos activos con su imagen de portada */
export async function getDestinations(opts?: {
  category?: string;
  maxPrice?: number;
  minRating?: number;
  search?: string;
  limit?: number;
}): Promise<(Destination & { cover_image?: string })[]> {
  let query = supabase
    .from("destinations")
    .select(`
      *,
      destination_images (url, sort_order)
    `)
    .eq("is_active", true)
    .order("is_featured", { ascending: false })
    .order("rating", { ascending: false });

  if (opts?.category) query = query.eq("category", opts.category);
  if (opts?.maxPrice) query = query.lte("price", opts.maxPrice);
  if (opts?.minRating) query = query.gte("rating", opts.minRating);
  if (opts?.search) query = query.ilike("name", `%${opts.search}%`);
  if (opts?.limit) query = query.limit(opts.limit);

  const { data, error } = await query;
  if (error || !data) return [];

  return data.map((d: any) => ({
    ...d,
    cover_image:
      d.destination_images?.find((i: any) => i.sort_order === 0)?.url ??
      d.destination_images?.[0]?.url ??
      null,
  }));
}

/** Obtiene un destino por su slug con todas sus imágenes */
export async function getDestinationBySlug(slug: string) {
  const { data, error } = await supabase
    .from("destinations")
    .select(`
      *,
      destination_images (*, sort_order),
      destination_tags (tag),
      destination_features (feature_key, feature_value, icon)
    `)
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error || !data) return null;

  return {
    ...data,
    images: (data.destination_images as DestinationImage[]).sort(
      (a, b) => a.sort_order - b.sort_order
    ),
    tags: (data.destination_tags as { tag: string }[]).map((t) => t.tag),
    features: data.destination_features,
  };
}

/** Obtiene un destino por su ID numérico o UUID */
export async function getDestinationById(id: string) {
  const { data, error } = await supabase
    .from("destinations")
    .select(`
      *,
      destination_images (url, sort_order),
      destination_tags (tag),
      destination_features (feature_key, feature_value, icon)
    `)
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return {
    ...data,
    images: (data.destination_images as DestinationImage[]).sort(
      (a, b) => a.sort_order - b.sort_order
    ),
    tags: (data.destination_tags as { tag: string }[]).map((t) => t.tag),
  };
}

// ─── RESTAURANTES ─────────────────────────────────────────────

/** Obtiene restaurantes vinculados a un destino */
export async function getRestaurantsByDestination(
  destinationId: string
): Promise<Restaurant[]> {
  const { data, error } = await supabase
    .from("restaurants")
    .select("*")
    .eq("destination_id", destinationId)
    .eq("is_active", true)
    .order("rating", { ascending: false })
    .limit(8);

  if (error || !data) return [];
  return data as Restaurant[];
}

// ─── RESEÑAS ──────────────────────────────────────────────────

/** Obtiene las reseñas publicadas de un destino */
export async function getReviewsByDestination(
  destinationId: string
): Promise<Review[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select(`
      *,
      profile:profiles (full_name, avatar_url),
      review_photos (url, sort_order)
    `)
    .eq("destination_id", destinationId)
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data as Review[];
}

/** Publica una nueva reseña */
export async function createReview(review: {
  userId: string;
  destinationId: string;
  rating: number;
  comment: string;
  title?: string;
}): Promise<{ data: Review | null; error: string | null }> {
  const { data, error } = await supabase
    .from("reviews")
    .insert({
      user_id: review.userId,
      destination_id: review.destinationId,
      rating: review.rating,
      comment: review.comment,
      title: review.title ?? null,
    })
    .select(`
      *,
      profile:profiles (full_name, avatar_url)
    `)
    .single();

  if (error) {
    if (error.code === "23505") return { data: null, error: "Ya publicaste una reseña para este destino." };
    return { data: null, error: "Error al publicar la reseña." };
  }
  return { data: data as Review, error: null };
}

/** Sube fotos de una reseña a Supabase Storage */
export async function uploadReviewPhotos(
  reviewId: string,
  files: File[]
): Promise<string[]> {
  const urls: string[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const ext = file.name.split(".").pop();
    const path = `review-photos/${reviewId}/${Date.now()}_${i}.${ext}`;

    const { error } = await supabase.storage
      .from("review-photos")
      .upload(path, file, { upsert: true });

    if (!error) {
      const { data: urlData } = supabase.storage
        .from("review-photos")
        .getPublicUrl(path);

      // Guardar referencia en la tabla
      await supabase.from("review_photos").insert({
        review_id: reviewId,
        storage_path: path,
        url: urlData.publicUrl,
        sort_order: i,
      });

      urls.push(urlData.publicUrl);
    }
  }

  return urls;
}

// ─── ESTADÍSTICAS DE RESEÑAS ──────────────────────────────────

export type ReviewStats = {
  avg_rating: number;
  total_reviews: number;
  five_stars: number;
  four_stars: number;
  three_stars: number;
  two_stars: number;
  one_star: number;
};

export async function getReviewStats(destinationId: string): Promise<ReviewStats | null> {
  const { data, error } = await supabase.rpc("get_review_stats", {
    p_destination_id: destinationId,
  });
  if (error || !data || !data[0]) return null;
  return data[0] as ReviewStats;
}

// ─── FAVORITOS ────────────────────────────────────────────────

/** Obtiene los destinos favoritos de un usuario */
export async function getUserFavorites(userId: string) {
  const { data, error } = await supabase
    .from("favorites")
    .select(`
      destination_id,
      created_at,
      destination:destinations (
        id, slug, name, short_description, category,
        price, price_label, rating, review_count,
        destination_images (url, sort_order)
      )
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data;
}
