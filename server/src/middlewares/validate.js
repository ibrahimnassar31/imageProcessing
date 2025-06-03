import Joi from 'joi';
import logger from '../utils/logger.js';

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const errorMessage = error.details.map((detail) => detail.message).join(', ');
      logger.warn(`Validation error: ${errorMessage}`);
      const err = new Error(errorMessage);
      err.statusCode = 400;
      return next(err);
    }
    next();
  };
};

export const schemas = {
  register: Joi.object({
    username: Joi.string().min(3).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  }),
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
  transform: Joi.object({
    transformations: Joi.object({
      resize: Joi.object({ width: Joi.number(), height: Joi.number() }).optional(),
      crop: Joi.object({
        width: Joi.number(),
        height: Joi.number(),
        x: Joi.number(),
        y: Joi.number(),
      }).optional(),
      rotate: Joi.number().optional(),
      watermark: Joi.object({ text: Joi.string() }).optional(),
      filters: Joi.object({ grayscale: Joi.boolean(), sepia: Joi.boolean() }).optional(),
      format: Joi.string().valid('jpg', 'png', 'webp').optional(),
    })
      .min(1)
      .required(),
  }),
  updateMetadata: Joi.object({
    metadata: Joi.object({
      originalName: Joi.string().optional(),
      description: Joi.string().optional(),
    }).min(1),
  }),
};

export default validate;