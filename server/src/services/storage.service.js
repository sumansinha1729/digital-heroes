import { randomUUID } from "crypto";
import { supabase } from "../config/supabase.js";
import { env } from "../config/env.js";

const SIGNED_URL_EXPIRY_SECONDS = 60 * 10; // 10 minutes — long enough to load an admin/user page

export class StorageError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

// Uploads a proof screenshot and returns the storage path (not a public URL — this bucket is
// private, so viewing requires a freshly generated signed URL, see getSignedProofUrl below).
export async function uploadWinnerProof(winnerId, file) {
  const extension = file.originalname.split(".").pop();
  const path = `${winnerId}/${randomUUID()}.${extension}`;

  const { error } = await supabase.storage
    .from(env.supabaseStorageBucket)
    .upload(path, file.buffer, { contentType: file.mimetype, upsert: false });

  if (error) {
    throw new StorageError(`Could not upload proof: ${error.message}`, 500);
  }

  return path;
}

export async function getSignedProofUrl(path) {
  const { data, error } = await supabase.storage
    .from(env.supabaseStorageBucket)
    .createSignedUrl(path, SIGNED_URL_EXPIRY_SECONDS);

  if (error) {
    throw new StorageError(`Could not generate proof URL: ${error.message}`, 500);
  }

  return data.signedUrl;
}
