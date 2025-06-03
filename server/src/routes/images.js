import express from 'express';
import multer from 'multer';
import authMiddleware from '../middlewares/auth.js';
import validate, { schemas } from '../middlewares/validate.js';
import {
  uploadImageController,
  getImageController,
  listImagesController,
  transformImageController,
  deleteImageController,
  updateMetadataController,
} from '../controllers/imageController.js';

const router =  express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only JPEG and PNG images are allowed'));
  },
});

router.post('/', authMiddleware, upload.single('image'), uploadImageController);
router.get('/:id', authMiddleware, getImageController);
router.get('/', authMiddleware, listImagesController);
router.post('/:id/transform', authMiddleware, validate(schemas.transform), transformImageController);
router.delete('/:id', authMiddleware, deleteImageController);
router.patch('/:id/metadata', authMiddleware, validate(schemas.updateMetadata), updateMetadataController);

export default router;