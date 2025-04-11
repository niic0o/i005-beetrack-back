import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

export async function uploadFile(filePath: string, folder: string) {
  return await cloudinary.uploader.upload(filePath, {
    folder: `beetrack/${folder}`,
    use_filename: true,
    resource_type: 'auto',
    width: 600,
    height: 600,
    crop: 'fill',
    quality: 'auto',
  });
}

export async function deleteFile(cloudinary_id: string) {
  return await cloudinary.uploader.destroy(cloudinary_id);
}

export default cloudinary;
