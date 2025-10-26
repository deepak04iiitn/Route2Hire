import DSAProblem from "../models/dsaProblem.model.js";
import { errorHandler } from "../utils/error.js";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dsaData = JSON.parse(fs.readFileSync(path.join(__dirname, '../../frontend/src/data/dsa.json'), 'utf8'));

// Get all DSA problems with user's progress
export const getDSAProblems = async (req, res, next) => {
    try {
        const userId = req.user.id;

        // Get user's progress for all problems
        const userProgress = await DSAProblem.find({ userId }).lean();
        
        // Create a map for quick lookup
        const progressMap = new Map();
        userProgress.forEach(progress => {
            progressMap.set(progress.problemName, progress);
        });

        // Group problems by category and difficulty
        const groupedProblems = {};
        
        dsaData.forEach(problem => {
            const { Category, Difficulty } = problem;
            
            if (!groupedProblems[Category]) {
                groupedProblems[Category] = {
                    Easy: [],
                    Medium: [],
                    Hard: []
                };
            }

            // Get user's progress for this problem
            const userProgressData = progressMap.get(problem["Problem Name"]) || {
                isCompleted: false,
                isFavorite: false,
                notes: "",
                completedAt: null
            };

            groupedProblems[Category][Difficulty].push({
                problemName: problem["Problem Name"],
                problemLink: problem["Problem Link"],
                category: Category,
                difficulty: Difficulty,
                isCompleted: userProgressData.isCompleted,
                isFavorite: userProgressData.isFavorite,
                notes: userProgressData.notes,
                completedAt: userProgressData.completedAt
            });
        });

        // Calculate progress statistics
        const totalProblems = dsaData.length;
        const completedProblems = userProgress.filter(p => p.isCompleted).length;
        const favoriteProblems = userProgress.filter(p => p.isFavorite).length;

        const progressStats = {
            total: totalProblems,
            completed: completedProblems,
            favorites: favoriteProblems,
            completionPercentage: totalProblems > 0 ? Math.round((completedProblems / totalProblems) * 100) : 0
        };

        res.json({
            success: true,
            data: {
                problems: groupedProblems,
                stats: progressStats
            }
        });

    } catch (error) {
        next(error);
    }
};

// Update problem status (completed/favorite)
export const updateProblemStatus = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { problemName, isCompleted, isFavorite } = req.body;

        if (!problemName) {
            return next(errorHandler(400, 'Problem name is required'));
        }

        // Find the problem in the DSA data to get its details
        const problemData = dsaData.find(p => p["Problem Name"] === problemName);
        if (!problemData) {
            return next(errorHandler(404, 'Problem not found'));
        }

        // Find or create the problem record
        let problem = await DSAProblem.findOne({ userId, problemName });
        
        if (!problem) {
            problem = new DSAProblem({
                userId,
                problemName,
                category: problemData.Category,
                difficulty: problemData.Difficulty,
                problemLink: problemData["Problem Link"]
            });
        }

        // Update the status
        if (isCompleted !== undefined) {
            problem.isCompleted = isCompleted;
            problem.completedAt = isCompleted ? new Date() : null;
        }
        
        if (isFavorite !== undefined) {
            problem.isFavorite = isFavorite;
        }

        await problem.save();

        res.json({
            success: true,
            message: 'Problem status updated successfully',
            data: {
                problemName: problem.problemName,
                isCompleted: problem.isCompleted,
                isFavorite: problem.isFavorite,
                completedAt: problem.completedAt
            }
        });

    } catch (error) {
        next(error);
    }
};

// Update problem notes
export const updateProblemNotes = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { problemName, notes } = req.body;

        if (!problemName) {
            return next(errorHandler(400, 'Problem name is required'));
        }

        // Find the problem in the DSA data to get its details
        const problemData = dsaData.find(p => p["Problem Name"] === problemName);
        if (!problemData) {
            return next(errorHandler(404, 'Problem not found'));
        }

        // Find or create the problem record
        let problem = await DSAProblem.findOne({ userId, problemName });
        
        if (!problem) {
            problem = new DSAProblem({
                userId,
                problemName,
                category: problemData.Category,
                difficulty: problemData.Difficulty,
                problemLink: problemData["Problem Link"]
            });
        }

        problem.notes = notes || "";
        await problem.save();

        res.json({
            success: true,
            message: 'Problem notes updated successfully',
            data: {
                problemName: problem.problemName,
                notes: problem.notes
            }
        });

    } catch (error) {
        next(error);
    }
};

// Get user's progress statistics
export const getProgressStats = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const userProgress = await DSAProblem.find({ userId });
        
        const totalProblems = dsaData.length;
        const completedProblems = userProgress.filter(p => p.isCompleted).length;
        const favoriteProblems = userProgress.filter(p => p.isFavorite).length;

        // Calculate progress by category
        const categoryStats = {};
        dsaData.forEach(problem => {
            const category = problem.Category;
            if (!categoryStats[category]) {
                categoryStats[category] = { total: 0, completed: 0 };
            }
            categoryStats[category].total++;
        });

        userProgress.forEach(progress => {
            if (progress.isCompleted && categoryStats[progress.category]) {
                categoryStats[progress.category].completed++;
            }
        });

        // Calculate progress by difficulty
        const difficultyStats = {
            Easy: { total: 0, completed: 0 },
            Medium: { total: 0, completed: 0 },
            Hard: { total: 0, completed: 0 }
        };

        dsaData.forEach(problem => {
            difficultyStats[problem.Difficulty].total++;
        });

        userProgress.forEach(progress => {
            if (progress.isCompleted) {
                difficultyStats[progress.difficulty].completed++;
            }
        });

        res.json({
            success: true,
            data: {
                overall: {
                    total: totalProblems,
                    completed: completedProblems,
                    favorites: favoriteProblems,
                    completionPercentage: totalProblems > 0 ? Math.round((completedProblems / totalProblems) * 100) : 0
                },
                byCategory: categoryStats,
                byDifficulty: difficultyStats
            }
        });

    } catch (error) {
        next(error);
    }
};

// Get problems by filter (completed, favorites, etc.)
export const getFilteredProblems = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { filter, category, difficulty } = req.query;

        let query = { userId };
        
        if (filter === 'completed') {
            query.isCompleted = true;
        } else if (filter === 'favorites') {
            query.isFavorite = true;
        } else if (filter === 'incomplete') {
            query.isCompleted = false;
        }

        if (category) {
            query.category = category;
        }

        if (difficulty) {
            query.difficulty = difficulty;
        }

        const problems = await DSAProblem.find(query).sort({ createdAt: -1 });

        res.json({
            success: true,
            data: problems
        });

    } catch (error) {
        next(error);
    }
};

// Bulk update problems (for bulk operations)
export const bulkUpdateProblems = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { problemNames, updates } = req.body;

        if (!problemNames || !Array.isArray(problemNames) || problemNames.length === 0) {
            return next(errorHandler(400, 'Problem names array is required'));
        }

        if (!updates || Object.keys(updates).length === 0) {
            return next(errorHandler(400, 'Updates object is required'));
        }

        const results = [];
        
        for (const problemName of problemNames) {
            // Find the problem in the DSA data to get its details
            const problemData = dsaData.find(p => p["Problem Name"] === problemName);
            if (!problemData) {
                results.push({ problemName, success: false, error: 'Problem not found' });
                continue;
            }

            // Find or create the problem record
            let problem = await DSAProblem.findOne({ userId, problemName });
            
            if (!problem) {
                problem = new DSAProblem({
                    userId,
                    problemName,
                    category: problemData.Category,
                    difficulty: problemData.Difficulty,
                    problemLink: problemData["Problem Link"]
                });
            }

            // Update the fields
            Object.keys(updates).forEach(key => {
                if (key === 'isCompleted' && updates[key]) {
                    problem.completedAt = new Date();
                } else if (key === 'isCompleted' && !updates[key]) {
                    problem.completedAt = null;
                }
                problem[key] = updates[key];
            });

            await problem.save();
            results.push({ problemName, success: true, data: problem });
        }

        res.json({
            success: true,
            message: 'Bulk update completed',
            data: results
        });

    } catch (error) {
        next(error);
    }
};

// Get user's recent activity
export const getRecentActivity = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { limit = 10 } = req.query;

        const recentActivity = await DSAProblem.find({ userId })
            .sort({ updatedAt: -1 })
            .limit(parseInt(limit))
            .select('problemName category difficulty isCompleted isFavorite updatedAt');

        res.json({
            success: true,
            data: recentActivity
        });

    } catch (error) {
        next(error);
    }
};
