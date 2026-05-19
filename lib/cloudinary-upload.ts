import { v2 as cloudinary } from "cloudinary";
import sharp from "sharp";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export type CloudinaryUploadResult = {
  secure_url: string;
  public_id: string;
  format: string;
};

export type CloudinaryDeleteResult = {
  result: string;
};

const MAX_SIZE_BYTES = 900 * 1024; // 900 KB

async function compressToMaxSize(buffer: Buffer): Promise<Buffer> {
  const metadata = await sharp(buffer).metadata();
  const isAnimated = (metadata.pages ?? 1) > 1;

  // Animated GIFs are passed through without compression
  if (isAnimated) return buffer;

  let quality = 85;
  let compressed: Buffer = await sharp(buffer)
    .resize({ width: 1920, withoutEnlargement: true })
    .jpeg({ quality, progressive: true })
    .toBuffer();

  while (compressed.length > MAX_SIZE_BYTES && quality > 20) {
    quality -= 10;
    compressed = await sharp(buffer)
      .resize({ width: 1920, withoutEnlargement: true })
      .jpeg({ quality, progressive: true })
      .toBuffer();
  }

  return compressed;
}

export async function uploadImage(
  file: Buffer,
  folder: string,
  publicId: string
): Promise<CloudinaryUploadResult> {
  const compressed = await compressToMaxSize(file);

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        resource_type: "image",
        overwrite: true,
      },
      (error, result) => {
        if (result) resolve(result as CloudinaryUploadResult);
        else reject(error);
      }
    );
    stream.end(compressed);
  });
}

export async function deleteImage(
  publicId: string
): Promise<CloudinaryDeleteResult> {
  return await cloudinary.uploader.destroy(publicId);
}

export default cloudinary;
