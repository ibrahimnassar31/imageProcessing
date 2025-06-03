import asyncHandler from '../utils/asyncHandler.js';
import logger from '../utils/logger.js';
import Image from '../models/Image.js';
import { uploadImage, transformImage, deleteImage } from '../services/imageService.js';
import { getCachedData, setCachedData } from '../utils/cache.js';

export const uploadImageController = asyncHandler(async (req, res) => {
  if (!req.file) {
    logger.warn('No file uploaded');
    const error = new Error('No file uploaded');
    error.statusCode = 400;
    throw error;
  }

  const result = await uploadImage(req.file.buffer);

  const image = new Image({
    user: req.user._id,
    cloudinaryId: result.public_id,
    url: result.secure_url,
    metadata: {
      originalName: req.file.originalname,
      size: req.file.size,
      format: req.file.mimetype.split('/')[1],
      width: result.width,
      height: result.height,
    },
  });

  await image.save();

  logger.info(`Image uploaded by user ${req.user.username}: ${result.public_id}`);
  res.status(201).json({
    success: true,
    data: { id: image._id, url: image.url, metadata: image.metadata },
  });
});

export const getImageController = asyncHandler(async (req, res) => {
  const image = await Image.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!image) {
    logger.warn(`Image not found: ${req.params.id}`);
    const error = new Error('Image not found');
    error.statusCode = 404;
    throw error;
  }

  logger.info(`Image retrieved: ${image.cloudinaryId}`);
  res.status(200).json({
    success: true,
    data: { id: image._id, url: image.url, metadata: image.metadata },
  });
});

export const listImagesController = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  const images = await Image.find({ user: req.user._id })
    .skip(skip)
    .limit(parseInt(limit))
    .select('url metadata createdAt');

  const total = await Image.countDocuments({ user: req.user._id });

  logger.info(`Images listed for user ${req.user.username}, page ${page}`);
  res.status(200).json({
    success: true,
    data: images,
    pagination: { page, limit, total },
  });
});

export const transformImageController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const transformations = req.body.transformations;

  if (!transformations || Object.keys(transformations).length === 0) {
    logger.warn('No transformations provided');
    const error = new Error('At least one transformation is required');
    error.statusCode = 400;
    throw error;
  }

  const image = await Image.findOne({ _id: id, user: req.user._id });
  if (!image) {
    logger.warn(`Image not found: ${id}`);
    const error = new Error('Image not found');
    error.statusCode = 404;
    throw error;
  }

  const cacheKey = `transform:${image.cloudinaryId}:${JSON.stringify(transformations)}`;
  const cachedUrl = await getCachedData(cacheKey);

  if (cachedUrl) {
    logger.info(`Serving cached transformed image: ${cacheKey}`);
    return res.status(200).json({
      success: true,
      data: { id: image._id, transformedUrl: cachedUrl, metadata: image.metadata },
    });
  }

  const transformedUrl = await transformImage(image.cloudinaryId, transformations);
  await setCachedData(cacheKey, transformedUrl);

  logger.info(`Image transformed for user ${req.user.username}: ${image.cloudinaryId}`);
  res.status(200).json({
    success: true,
    data: { id: image._id, transformedUrl, metadata: image.metadata },
  });
});

export const deleteImageController = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const image = await Image.findOne({ _id: id, user: req.user._id });
  if (!image) {
    logger.warn(`Image not found: ${id}`);
    const error = new Error('Image not found');
    error.statusCode = 404;
    throw error;
  }

  await deleteImage(image.cloudinaryId);
  await Image.deleteOne({ _id: id });

  logger.info(`Image deleted by user ${req.user.username}: ${image.cloudinaryId}`);
  res.status(200).json({
    success: true,
    message: 'Image deleted successfully',
  });
});

export const updateMetadataController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { metadata } = req.body;

  const image = await Image.findOne({ _id: id, user: req.user._id });
  if (!image) {
    logger.warn(`Image not found: ${id}`);
    const error = new Error('Image not found');
    error.statusCode = 404;
    throw error;
  }

  image.metadata = {
    ...image.metadata,
    ...metadata,
  };

  await image.save();

  logger.info(`Metadata updated for image ${image.cloudinaryId} by user ${req.user.username}`);
  res.status(200).json({
    success: true,
    data: { id: image._id, url: image.url, metadata: image.metadata },
  });
});