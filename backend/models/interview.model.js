import mongoose from "mongoose";

const interviewExperienceSchema = new mongoose.Schema(
{
  fullName: {
    type: String,
    required: false,
    trim: true,
    default: 'Anonymous',
  },

  company: {
    type: String,
    required: true,
    trim: true,
  },

  position: {
    type: String,
    required: true,
    trim: true,
  },

  experience: {
    type: String,
    required: true,
  },

  yoe: {
    type: Number,
    required: false,
    default: 0,
  },

  verdict: {
    type: String,
    required: false,
    enum: ['selected', 'rejected', 'N/A'],
    default: 'N/A',
  },

  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },

  linkedin: {
    type: String,
    required: false,
    default: 'Not Provided',
  },

  likes: {
    type: Array,
    default: [],
  },

  numberOfLikes: {
    type: Number,
    default: 0,
  },

  dislikes: {
    type: Array,
    default: [],
  },
  
  numberOfDislikes: {
    type: Number,
    default: 0,
  },

  userRef: {
    type: String,
    required: true,
  },

},
  { timestamps: true }
);

const InterviewExperience = mongoose.model('InterviewExperience', interviewExperienceSchema);

export default InterviewExperience;