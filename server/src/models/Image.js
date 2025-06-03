import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    cloudinaryId: {
      type: String,
      required: [true, 'Cloudinary ID is required'],
    },
    url: {
      type: String,
      required: [true, 'Image URL is required'],
    },
    metadata: {
      originalName: String,
      size: Number,
      format: String,
      width: Number,
      height: Number,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Image', imageSchema);