import { v2 as cloudinary } from 'cloudinary';
import logger from '../utils/logger.js';

export const uploadImage = async (fileBuffer, folder = 'image-service') => {
  try {
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder }, (error, result) => {
          if (error) {
            logger.error(`Cloudinary upload failed: ${error.message}`);
            reject(new Error('Failed to upload image'));
          }
          logger.info(`Image uploaded to Cloudinary: ${result.public_id}`);
          resolve(result);
        })
        .end(fileBuffer);
    });
  } catch (error) {
    logger.error(`Cloudinary service error: ${error.message}`);
    throw error;
  }
};

export const transformImage = async (cloudinaryId, transformations) => {
  try {
    const transformationOptions = [];

    if (transformations.resize) {
      transformationOptions.push({
        width: transformations.resize.width,
        height: transformations.resize.height,
        crop: 'fill',
      });
    }
    if (transformations.crop) {
      transformationOptions.push({
        width: transformations.crop.width,
        height: transformations.crop.height,
        crop: 'crop',
        x: transformations.crop.x,
        y: transformations.crop.y,
      });
    }
    if (transformations.rotate) {
      transformationOptions.push({ angle: transformations.rotate });
    }
    if (transformations.watermark) {
      transformationOptions.push({
        overlay: transformations.watermark.text,
        gravity: 'center',
        opacity: 0.5,
      });
    }
    if (transformations.filters) {
      if (transformations.filters.grayscale) {
        transformationOptions.push({ effect: 'grayscale' });
      }
      if (transformations.filters.sepia) {
        transformationOptions.push({ effect: 'sepia' });
      }
    }
    if (transformations.format) {
      transformationOptions.push({ fetch_format: transformations.format });
    }

    const transformedUrl = cloudinary.url(cloudinaryId, {
      transformation: transformationOptions,
    });

    logger.info(`Image transformed: ${cloudinaryId}`);
    return transformedUrl;
  } catch (error) {
    logger.error(`Cloudinary transformation failed: ${error.message}`);
    throw new Error('Failed to transform image');
  }
};