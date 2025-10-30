import mongoose from 'mongoose';

const featureRequestSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, trim: true, lowercase: true },
    description: { type: String, required: true, trim: true },
    pageUrl: { type: String, trim: true },
    userAgent: { type: String, trim: true },
    status: {
      type: String,
      enum: ['Pending', 'Implemented'],
      default: 'Pending',
      index: true,
    },
  },
  { timestamps: true }
);

featureRequestSchema.index({ email: 'text', description: 'text' });

const FeatureRequest = mongoose.model('FeatureRequest', featureRequestSchema);

export default FeatureRequest;


