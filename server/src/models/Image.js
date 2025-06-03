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
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    metadata: {
      originalName: { type: String, required: true },
      description: { type: String, default: '' },
      size: { type: Number, required: true },
      format: { type: String, required: true },
      width: { type: Number, required: true },
      height: { type: Number, required: true },
    },
  },
  { timestamps: true }
);

export default mongoose.model('Image', imageSchema);