"use client";

const DEFAULT_MAX_SIZE_BYTES = 900 * 1024;

type CompressOptions = {
  maxWidth?: number;
  maxSizeBytes?: number;
};

/**
 * Resizes/re-encodes an image in the browser before it's sent to the
 * uploadImage server action, so large camera photos don't hit the Next.js
 * server action body size limit. Falls back to the original file on any
 * failure — lib/cloudinary-upload.ts still compresses server-side as a
 * safety net.
 */
export async function compressImageFile(
  file: File,
  { maxWidth = 1920, maxSizeBytes = DEFAULT_MAX_SIZE_BYTES }: CompressOptions = {},
): Promise<File> {
  if (file.size <= maxSizeBytes || typeof createImageBitmap === "undefined") {
    return file;
  }

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxWidth / bitmap.width);
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);

    // PNGs can carry transparency (e.g. logos): re-encode to WebP (keeps
    // alpha) instead of flattening it onto a JPEG background.
    const hasAlpha = file.type === "image/png";
    const outputType = hasAlpha ? "image/webp" : "image/jpeg";
    const outputExt = hasAlpha ? "webp" : "jpg";

    let quality = 0.85;
    let blob = await canvasToBlob(canvas, outputType, quality);

    while (blob.size > maxSizeBytes && quality > 0.2) {
      quality -= 0.1;
      blob = await canvasToBlob(canvas, outputType, quality);
    }

    if (blob.size >= file.size) return file;

    return new File([blob], replaceExtension(file.name, outputExt), {
      type: outputType,
      lastModified: Date.now(),
    });
  } catch {
    return file;
  }
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("toBlob failed"))),
      type,
      quality,
    );
  });
}

function replaceExtension(name: string, ext: string): string {
  return `${name.replace(/\.[^./\\]+$/, "")}.${ext}`;
}
