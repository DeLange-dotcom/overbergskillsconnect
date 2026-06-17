import { supabase } from "@/integrations/supabase/client";

/**
 * Upload a document to the private apprenticeship-documents bucket.
 * Returns the storage path or null if not possible (e.g. user not signed in).
 * Storage RLS requires the first folder segment to be the user's auth.uid().
 */
export async function uploadApprenticeshipDoc(
  file: File,
  subfolder: "cv" | "parent-consent" | "verification",
): Promise<{ path: string } | { error: string }> {
  const { data: userData } = await supabase.auth.getUser();
  const uid = userData.user?.id;
  if (!uid) {
    return { error: "Please sign in to upload documents." };
  }
  const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
  const path = `${uid}/${subfolder}/${Date.now()}-${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from("apprenticeship-documents")
    .upload(path, file, { upsert: false, contentType: file.type || undefined });
  if (error) return { error: error.message };
  return { path };
}
