import "server-only";

import { testCars, type Car } from "@/app/data/cars";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { BOOKING_STATUSES_BLOCKING_CAR_DELETE } from "@/lib/booking-model";

const CAR_IMAGES_BUCKET = "car-images";

export type CarRecord = {
  id: string;
  name: string;
  category: string;
  tagline: string;
  description: string;
  day_rate: number;
  card_image_url: string;
  gallery_image_urls: string[];
  is_active: boolean;
  pending_turnover?: boolean;
  booking_count?: number;
  passenger_capacity?: number | null;
};

function toAppCar(record: CarRecord): Car {
  return {
    id: record.id,
    name: record.name,
    category: record.category,
    tagline: record.tagline,
    description: record.description,
    dayRate: Number(record.day_rate),
    cardImage: record.card_image_url,
    images: record.gallery_image_urls?.length ? record.gallery_image_urls : [record.card_image_url],
    passengerCapacity: record.passenger_capacity ?? null,
  };
}

function fallbackCars() {
  return testCars;
}

export async function listCars(): Promise<Car[]> {
  if (!hasSupabaseEnv()) return fallbackCars();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cars")
    .select("*")
    .eq("is_active", true)
    .eq("pending_turnover", false)
    .order("created_at", { ascending: true });

  if (error || !data?.length) return fallbackCars();
  return data.map((row) => toAppCar(row as CarRecord));
}

export async function getCarById(id: string): Promise<Car | null> {
  if (!hasSupabaseEnv()) {
    return fallbackCars().find((car) => car.id === id) ?? null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cars")
    .select("*")
    .eq("id", id)
    .eq("is_active", true)
    .eq("pending_turnover", false)
    .maybeSingle();

  if (error || !data) {
    return fallbackCars().find((car) => car.id === id) ?? null;
  }
  return toAppCar(data as CarRecord);
}

function slugifyName(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function uploadCarImage(file: File, prefix: string): Promise<string> {
  const supabase = await createClient();
  const path = `${prefix}/${crypto.randomUUID()}-${file.name.replace(/\s+/g, "-").toLowerCase()}`;
  const bytes = await file.arrayBuffer();
  const contentType = file.type || "application/octet-stream";

  const { error } = await supabase.storage.from(CAR_IMAGES_BUCKET).upload(path, bytes, {
    contentType,
    upsert: false,
  });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase.storage.from(CAR_IMAGES_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function upsertCar(input: {
  id?: string;
  name: string;
  category: string;
  tagline: string;
  description: string;
  dayRate: number;
  cardImageUrl: string;
  galleryImageUrls: string[];
  isActive?: boolean;
  pendingTurnover?: boolean;
  passengerCapacity: number | null;
}): Promise<string> {
  const supabase = await createClient();
  const id = input.id?.trim() || slugifyName(input.name);
  const payload = {
    id,
    name: input.name.trim(),
    category: input.category.trim(),
    tagline: input.tagline.trim(),
    description: input.description.trim(),
    day_rate: input.dayRate,
    card_image_url: input.cardImageUrl,
    gallery_image_urls: input.galleryImageUrls,
    is_active: input.isActive ?? true,
    pending_turnover: input.pendingTurnover ?? false,
    passenger_capacity: input.passengerCapacity,
  };

  const { error } = await supabase.from("cars").upsert(payload, { onConflict: "id" });
  if (error) {
    throw new Error(error.message);
  }

  return id;
}

export async function requireAdmin() {
  if (!hasSupabaseEnv()) {
    throw new Error("Supabase environment variables are not configured.");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Please sign in first.");
  }

  if (user.app_metadata?.role !== "admin") {
    throw new Error("Unauthorized");
  }
}

export async function listCarsForAdmin(): Promise<CarRecord[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("cars").select("*").order("created_at", { ascending: true });
  if (error) {
    throw new Error(error.message);
  }

  return (data as CarRecord[]) ?? [];
}

function storagePathFromPublicUrl(url: string): string | null {
  const marker = `/storage/v1/object/public/${CAR_IMAGES_BUCKET}/`;
  const markerIndex = url.indexOf(marker);
  if (markerIndex === -1) {
    return null;
  }

  const rawPath = url.slice(markerIndex + marker.length);
  if (!rawPath) {
    return null;
  }

  try {
    return decodeURIComponent(rawPath);
  } catch {
    return rawPath;
  }
}

const BOOKING_BLOCK_DELETE_MESSAGE =
  "This car still has pending, upcoming, active, or cancellation-requested bookings and cannot be permanently deleted.";

export async function deleteCarById(id: string) {
  const supabase = await createClient();
  const { count: blockingBookingCount, error: countError } = await supabase
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .eq("car_id", id)
    .in("status", [...BOOKING_STATUSES_BLOCKING_CAR_DELETE]);

  if (countError) {
    throw new Error(countError.message);
  }

  if ((blockingBookingCount ?? 0) > 0) {
    throw new Error(BOOKING_BLOCK_DELETE_MESSAGE);
  }

  const { data: car, error: fetchError } = await supabase
    .from("cars")
    .select("card_image_url, gallery_image_urls")
    .eq("id", id)
    .maybeSingle();
  if (fetchError) {
    throw new Error(fetchError.message);
  }

  const { error: deleteError } = await supabase.from("cars").delete().eq("id", id);
  if (deleteError) {
    throw new Error(deleteError.message);
  }

  if (!car) return;

  const imageUrls = [car.card_image_url, ...(car.gallery_image_urls ?? [])].filter(Boolean);
  const storagePaths = Array.from(
    new Set(imageUrls.map((url) => storagePathFromPublicUrl(url)).filter((path): path is string => Boolean(path))),
  );

  if (!storagePaths.length) return;

  const { error: storageError } = await supabase.storage.from(CAR_IMAGES_BUCKET).remove(storagePaths);
  if (storageError) {
    throw new Error(storageError.message);
  }
}
