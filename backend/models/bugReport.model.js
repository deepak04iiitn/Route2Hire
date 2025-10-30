import mongoose from 'mongoose';

const bugReportSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, trim: true, lowercase: true },
    description: { type: String, required: true, trim: true },
    pageUrl: { type: String, trim: true },
    userAgent: { type: String, trim: true },
    status: {
      type: String,
      enum: ['Pending', 'Resolved'],
      default: 'Pending',
      index: true,
    },
  },
  { timestamps: true }
);

bugReportSchema.index({ email: 'text', description: 'text' });

const BugReport = mongoose.model('BugReport', bugReportSchema);

export default BugReport;


