import fs from 'fs';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';
import path from 'path';

const hasValidMimeType = (file: File): Boolean => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  return validTypes.includes(file.type);
};

const hasValidSize = (file: File): Boolean => {
  const maxSize = 2 * 1024 * 1024;
  return file.size <= maxSize;
};

export const writeFile = async (file: File) => {
  if (!hasValidMimeType(file)) {
    throw new Error('El archivo debe ser de tipo jpeg, jpg, png o webp');
  }
  if (!hasValidSize(file)) {
    throw new Error('El archivo supera los 2MB');
  }
  const uploadDir = path.join(process.cwd(), 'public', 'temp');

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const filePath = path.join(uploadDir, `${Date.now()}-${file.name}`);
  // Convertir el ReadableStream a un Node.js Stream
  const nodeReadableStream = Readable.fromWeb(file.stream() as any);
  try {
    await pipeline(nodeReadableStream, fs.createWriteStream(filePath));
  } catch (error) {
    throw new Error('Error al escribir el archivo en el sistema de archivos');
  }

  return filePath;
};

export const removeFile = (filePath: string) => {
  fs.unlink(filePath, (err) => {
    if (err) {
      throw new Error('Error al eliminar el archivo');
    } else {
      return null;
    }
  });
};

export const setProductStatus = (stock: number, stock_min: number): string => {
  if (stock === 0) {
    return 'SOLDOUT';
  } else if (stock < stock_min) {
    return 'LIMITED';
  } else {
    return 'AVAILABLE';
  }
};

export const isValidFile = (file: unknown): file is File => {
  return file instanceof File;
};
