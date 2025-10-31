import mongoose from "mongoose";

const learningStepSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  resources: [{
    resourceType: String, // Changed from 'type' to 'resourceType' to avoid conflict
    title: String,
    url: String
  }],
  estimatedHours: Number,
  order: Number
});

const skillNodeSchema = new mongoose.Schema({
  id: { type: String, required: true },
  label: { type: String, required: true },
  description: String,
  icon: String,
  level: { type: Number, required: true },
  position: {
    x: Number,
    y: Number
  },
  prerequisites: [String],
  learningSteps: [learningStepSchema],
  order: Number,
  category: String,
  subSkills: [{
    id: String,
    label: String,
    description: String
  }]
});

const roadmapSchema = new mongoose.Schema({
  role: {
    type: String,
    required: true,
    unique: true
  },
  title: String,
  description: String,
  nodes: [skillNodeSchema],
  totalEstimatedHours: Number,
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Intermediate'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

const userProgressSchema = new mongoose.Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    roadmapId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Roadmap',
      required: true
    },
    role: String,
    completedNodes: [{
      nodeId: String,
      completedAt: Date,
      notes: String,
      completedSubskills: [Number]  // Add this line - array of step order numbers
    }],
    currentNode: String,
    totalProgress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    guidedMode: {
      type: Boolean,
      default: true
    },
    lastAccessed: {
      type: Date,
      default: Date.now
    },
    milestones: [{
      title: String,
      achievedAt: Date,
      description: String
    }]
  }, { timestamps: true });

roadmapSchema.index({ role: 1, isActive: 1 });
userProgressSchema.index({ userId: 1, roadmapId: 1 });
userProgressSchema.index({ userId: 1, role: 1 });

const Roadmap = mongoose.model('Roadmap', roadmapSchema);
const UserProgress = mongoose.model('UserProgress', userProgressSchema);

export { Roadmap, UserProgress };
