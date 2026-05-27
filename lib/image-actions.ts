"use server";

import { uploadImage as cloudinaryUpload, deleteImage as cloudinaryDelete } from "./cloudinary-upload";
import { v4 as uuidv4 } from "uuid";

type UploadSuccess = {
  url: string;
  publicId: string;
  format: string;
};

type UploadError = {
  ok: false;
};

/**
 * Generic server action to upload an image to Cloudinary.
 * @param formData - FormData with a "file" field
 * @param folder   - Cloudinary folder (e.g. "events", "producers")
 */
export async function uploadImage(
  formData: FormData,
  folder: string,
  maxWidth = 1920
): Promise<UploadSuccess | UploadError> {
  const file = formData.get("file") as File | null;
  if (!file) return { ok: false };

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const publicId = uuidv4();
    const result = await cloudinaryUpload(buffer, folder, publicId, maxWidth);
    return {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
    };
  } catch {
    return { ok: false };
  }
}

/**
 * Generic server action to delete an image from Cloudinary by its public_id.
 * @param publicId - The Cloudinary public_id returned when the image was uploaded
 */
export async function deleteImage(
  publicId: string
): Promise<{ result: string }> {
  return await cloudinaryDelete(publicId);
}
