import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function uploadFile(
  file: Buffer,
  folder: string,
  public_id: string
) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id,
        transformation: [{ crop: "scale", quality: "auto", width: "800" }],
      },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      }
    );
    uploadStream.end(file);
  });
}

export async function deleteFile(publicId: string) {
  const newUrl = publicId.substring(publicId.lastIndexOf("/") + 1);  
  return await cloudinary.uploader.destroy(
    `${process.env.CLIENT_ID}/${newUrl.split(".")[0]}`,
    {}
  );  
}

export default cloudinary;
