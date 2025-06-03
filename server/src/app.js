import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import connectDB from './config/db.js';
import configureCloudinary from './config/cloudinary.js';
import errorHandler from './middlewares/errorHandler.js';
import rateLimiter from './middlewares/rateLimiter.js';
import logger from './utils/logger.js';
import authRoutes from './routes/auth.js';
import imageRoutes from './routes/images.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// الاتصال بقاعدة البيانات
connectDB();

// إعداد Cloudinary
configureCloudinary();

// Middleware
app.use(helmet());
app.use(cors());
app.use(rateLimiter); // إضافة Rate Limiting
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// المسارات
app.use('/api/auth', authRoutes);
app.use('/api/images', imageRoutes);

app.get('/', (req, res) => {
  logger.info('Accessed root endpoint');
  res.send('Image Processing Service is running!');
});

// معالجة الأخطاء
app.use(errorHandler);

app.listen(port, () => {
  logger.info(`Server running on port ${port}`);
});

export default app;