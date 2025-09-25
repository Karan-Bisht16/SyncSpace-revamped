import sharp from 'sharp';
// importing types
import type { CompressWebpParams, ConvertToWebpParams } from '../types/index.js';

export const convertToWebp = async (params: ConvertToWebpParams) => {
    const { fileBuffer } = params;
    const image = sharp(fileBuffer);
    return await image.webp({ quality: 100 }).toBuffer();
};

export const compressWebp = async (params: CompressWebpParams) => {
    const { webpBuffer } = params;
    const image = sharp(webpBuffer);
    
    const metadata = await image.metadata();
    const width = metadata.width ? Math.floor(metadata.width * 0.5) : undefined;
    const height = metadata.height ? Math.floor(metadata.height * 0.5) : undefined;

    return await image
        .resize(width, height)
        .webp({ quality: 50 })
        .toBuffer();
};