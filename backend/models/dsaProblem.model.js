import mongoose from "mongoose";

const dsaProblemSchema = new mongoose.Schema({
    problemName: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    difficulty: {
        type: String,
        required: true,
        enum: ["Easy", "Medium", "Hard"]
    },
    problemLink: {
        type: String,
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isCompleted: {
        type: Boolean,
        default: false
    },
    isFavorite: {
        type: Boolean,
        default: false
    },
    notes: {
        type: String,
        default: ""
    },
    completedAt: {
        type: Date,
        default: null
    }
}, { timestamps: true });

// Create compound index for efficient queries
dsaProblemSchema.index({ userId: 1, problemName: 1 }, { unique: true });
dsaProblemSchema.index({ userId: 1, category: 1 });
dsaProblemSchema.index({ userId: 1, difficulty: 1 });
dsaProblemSchema.index({ userId: 1, isCompleted: 1 });
dsaProblemSchema.index({ userId: 1, isFavorite: 1 });

const DSAProblem = mongoose.model('DSAProblem', dsaProblemSchema);

export default DSAProblem;
