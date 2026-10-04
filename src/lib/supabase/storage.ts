import { createClient } from "@/lib/supabase/client";

const BUCKET = "site-images";

/**
 * Upload a file to Supabase Storage.
 * Returns the public URL on success.
 */
export async function uploadImage(
  file: File,
  folder: string = "uploads"
): Promise<string> {
  const supabase = createClient();

  // Validate
  if (!file.type.startsWith("image/")) {
    throw new Error("Only image files are allowed.");
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("File must be under 5 MB.");
  }

  // Generate a unique file name
  const ext = file.name.split(".").pop() || "jpg";
  const fileName = `${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 10)}.${ext}`;
  const filePath = `${folder}/${fileName}`;

  // Upload
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  // Get public URL
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
  return data.publicUrl;
}

/**
 * Delete a file from Supabase Storage by its public URL.
 */
export async function deleteImageByUrl(publicUrl: string): Promise<void> {
  const supabase = createClient();

  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return; // Not one of our files

  const filePath = publicUrl.substring(idx + marker.length);
  await supabase.storage.from(BUCKET).remove([filePath]);
}