import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';

interface UnsplashPhoto {
  urls: {
    regular: string;
    [key: string]: any;
  };
  [key: string]: any;
}

interface UnsplashResponse {
  results: UnsplashPhoto[];
}

export const getImgUnsplash = async (
  apiKey: string,
  query: string,
  cantidad = 1
): Promise<string> => {
  const url = `https://api.unsplash.com/search/photos?query=${query}&client_id=${apiKey}&per_page=${cantidad}`;
  const response = await axios.get<UnsplashResponse>(url);
  const dato = response.data.results[0];
  return dato.urls.regular;
};

export const downloadImage = async (imageUrl: string, filename: string) => {
  try {
    const uploadDir = path.join(process.cwd(), 'public', 'temp');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Obtenemos el stream de la URL
    const response = await axios.get(imageUrl, { responseType: 'stream' });

    const extension = '.jpg';
    const filePath = path.join(uploadDir, `${filename}${extension}`);

    // Solo pipeline: lee del response.data y escribe directo al fichero
    await pipeline(response.data, fs.createWriteStream(filePath));

    return filePath;
  } catch (error: any) {
    console.error(`❌ Error al descargar imagen de ${imageUrl}:`, error.message);
    return null;
  }
};