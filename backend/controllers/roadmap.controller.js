import { Roadmap, UserProgress } from '../models/roadmap.model.js';
import { errorHandler } from '../utils/error.js';

// Get all available roadmaps
export const getRoadmaps = async (req, res, next) => {
  try {
    // Remove the .select() to include all fields, especially nodes
    const roadmaps = await Roadmap.find({ isActive: true })
      .sort({ role: 1 });
    
    res.status(200).json({
      success: true,
      count: roadmaps.length,
      data: roadmaps
    });
  } catch (error) {
    next(error);
  }
};

// Get specific roadmap by role
export const getRoadmapByRole = async (req, res, next) => {
  try {
    const { role } = req.params;
    
    const roadmap = await Roadmap.findOne({ 
      role: role,
      isActive: true 
    });
    
    if (!roadmap) {
      return next(errorHandler(404, 'Roadmap not found'));
    }
    
    res.status(200).json({
      success: true,
      data: roadmap
    });
  } catch (error) {
    next(error);
  }
};

// Get user's progress for a specific roadmap
export const getUserProgress = async (req, res, next) => {
  try {
    const { userId, role } = req.params;
    
    // Verify user is accessing their own data
    if (req.user.id !== userId && !req.user.isUserAdmin) {
      return next(errorHandler(403, 'You can only access your own progress'));
    }
    
    const roadmap = await Roadmap.findOne({ role, isActive: true });
    if (!roadmap) {
      return next(errorHandler(404, 'Roadmap not found'));
    }
    
    let progress = await UserProgress.findOne({ 
      userId, 
      roadmapId: roadmap._id 
    });
    
    // Create initial progress if doesn't exist
    if (!progress) {
      progress = await UserProgress.create({
        userId,
        roadmapId: roadmap._id,
        role,
        completedNodes: [],
        totalProgress: 0
      });
    }
    
    res.status(200).json({
      success: true,
      data: progress
    });
  } catch (error) {
    next(error);
  }
};

// Update user progress - mark node as complete
export const updateNodeProgress = async (req, res, next) => {
  try {
    const { userId, role } = req.params;
    const { nodeId, notes } = req.body;
    
    if (req.user.id !== userId && !req.user.isUserAdmin) {
      return next(errorHandler(403, 'You can only update your own progress'));
    }
    
    const roadmap = await Roadmap.findOne({ role, isActive: true });
    if (!roadmap) {
      return next(errorHandler(404, 'Roadmap not found'));
    }
    
    let progress = await UserProgress.findOne({ 
      userId, 
      roadmapId: roadmap._id 
    });
    
    if (!progress) {
      progress = await UserProgress.create({
        userId,
        roadmapId: roadmap._id,
        role,
        completedNodes: [],
        totalProgress: 0
      });
    }
    
    // Check if node already completed
    const existingNode = progress.completedNodes.find(
      node => node.nodeId === nodeId
    );
    
    if (!existingNode) {
      progress.completedNodes.push({
        nodeId,
        completedAt: new Date(),
        notes: notes || ''
      });
      
      // Calculate new progress percentage
      const totalNodes = roadmap.nodes.length;
      progress.totalProgress = Math.round(
        (progress.completedNodes.length / totalNodes) * 100
      );
      
      // Update current node to next recommended
      const completedNodeIds = progress.completedNodes.map(n => n.nodeId);
      const nextNode = findNextRecommendedNode(roadmap.nodes, completedNodeIds);
      progress.currentNode = nextNode?.id || null;
      
      // Check for milestones
      checkAndAddMilestones(progress, roadmap);
    }
    
    progress.lastAccessed = new Date();
    await progress.save();
    
    res.status(200).json({
      success: true,
      data: progress,
      milestone: progress.totalProgress % 25 === 0 && progress.totalProgress > 0
    });
  } catch (error) {
    next(error);
  }
};

// Toggle guided mode
export const toggleGuidedMode = async (req, res, next) => {
  try {
    const { userId, role } = req.params;
    
    if (req.user.id !== userId && !req.user.isUserAdmin) {
      return next(errorHandler(403, 'You can only update your own settings'));
    }
    
    const roadmap = await Roadmap.findOne({ role, isActive: true });
    if (!roadmap) {
      return next(errorHandler(404, 'Roadmap not found'));
    }
    
    const progress = await UserProgress.findOne({ 
      userId, 
      roadmapId: roadmap._id 
    });
    
    if (!progress) {
      return next(errorHandler(404, 'Progress not found'));
    }
    
    progress.guidedMode = !progress.guidedMode;
    await progress.save();
    
    res.status(200).json({
      success: true,
      data: progress
    });
  } catch (error) {
    next(error);
  }
};

// Get public progress share
export const getSharedProgress = async (req, res, next) => {
  try {
    const { userId, role } = req.params;
    
    const roadmap = await Roadmap.findOne({ role, isActive: true });
    if (!roadmap) {
      return next(errorHandler(404, 'Roadmap not found'));
    }
    
    const progress = await UserProgress.findOne({ 
      userId, 
      roadmapId: roadmap._id 
    }).populate('userId', 'username profilePicture');
    
    if (!progress) {
      return next(errorHandler(404, 'Progress not found'));
    }
    
    res.status(200).json({
      success: true,
      data: {
        user: progress.userId,
        role: progress.role,
        totalProgress: progress.totalProgress,
        completedNodes: progress.completedNodes.length,
        totalNodes: roadmap.nodes.length,
        milestones: progress.milestones
      }
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to find next recommended node
function findNextRecommendedNode(nodes, completedNodeIds) {
  // Sort nodes by level and order
  const sortedNodes = nodes.sort((a, b) => {
    if (a.level !== b.level) return a.level - b.level;
    return a.order - b.order;
  });
  
  for (const node of sortedNodes) {
    // Skip if already completed
    if (completedNodeIds.includes(node.id)) continue;
    
    // Check if all prerequisites are completed
    const prerequisitesMet = node.prerequisites.every(
      prereq => completedNodeIds.includes(prereq)
    );
    
    if (prerequisitesMet) {
      return node;
    }
  }
  
  return null;
}

// Add this updated function to roadmap.controller.js

export const updateSubskillProgress = async (req, res, next) => {
    try {
      const { userId, role } = req.params;
      const { nodeId, subskillId } = req.body;
      
      if (req.user.id !== userId && !req.user.isUserAdmin) {
        return next(errorHandler(403, 'You can only update your own progress'));
      }
      
      const roadmap = await Roadmap.findOne({ role, isActive: true });
      if (!roadmap) {
        return next(errorHandler(404, 'Roadmap not found'));
      }
      
      // Find the skill node to check total steps
      const skillNode = roadmap.nodes.find(n => n.id === nodeId);
      if (!skillNode) {
        return next(errorHandler(404, 'Skill node not found'));
      }
      
      let progress = await UserProgress.findOne({ 
        userId, 
        roadmapId: roadmap._id 
      });
      
      if (!progress) {
        progress = await UserProgress.create({
          userId,
          roadmapId: roadmap._id,
          role,
          completedNodes: [],
          totalProgress: 0
        });
      }
      
      // Store old progress for comparison
      const oldProgress = progress.totalProgress;
      
      // Find or create the node progress
      let nodeProgress = progress.completedNodes.find(n => n.nodeId === nodeId);
      
      if (!nodeProgress) {
        nodeProgress = {
          nodeId,
          completedAt: new Date(),
          completedSubskills: [subskillId],
          notes: ''
        };
        progress.completedNodes.push(nodeProgress);
      } else {
        if (!nodeProgress.completedSubskills) {
          nodeProgress.completedSubskills = [];
        }
        
        const subskillIndex = nodeProgress.completedSubskills.indexOf(subskillId);
        if (subskillIndex > -1) {
          // Remove subskill (unchecking)
          nodeProgress.completedSubskills.splice(subskillIndex, 1);
          
          // If no subskills left, remove the node entirely
          if (nodeProgress.completedSubskills.length === 0) {
            progress.completedNodes = progress.completedNodes.filter(n => n.nodeId !== nodeId);
          }
        } else {
          // Add subskill
          nodeProgress.completedSubskills.push(subskillId);
        }
      }
      
      // Calculate overall progress
      const totalNodes = roadmap.nodes.length;
      const completedNodesCount = progress.completedNodes.filter(node => {
        const roadmapNode = roadmap.nodes.find(n => n.id === node.nodeId);
        if (!roadmapNode) return false;
        
        const totalSteps = roadmapNode.learningSteps?.length || 0;
        const completedSteps = node.completedSubskills?.length || 0;
        
        return totalSteps > 0 && completedSteps === totalSteps;
      }).length;
      
      progress.totalProgress = Math.round((completedNodesCount / totalNodes) * 100);
      
      // Check if we hit 50% or 100% milestone
      let hitMilestone = false;
      
      if (oldProgress < 50 && progress.totalProgress >= 50) {
        // Just hit 50%
        hitMilestone = true;
        checkAndAddMilestones(progress, roadmap);
      } else if (oldProgress < 100 && progress.totalProgress === 100) {
        // Just hit 100%
        hitMilestone = true;
        checkAndAddMilestones(progress, roadmap);
      }
      
      progress.lastAccessed = new Date();
      await progress.save();
      
      res.status(200).json({
        success: true,
        data: progress,
        milestone: hitMilestone
      });
    } catch (error) {
      next(error);
    }
  };
  
  // Updated helper function for milestones
  function checkAndAddMilestones(progress, roadmap) {
    const percentage = progress.totalProgress;
    const milestoneMessages = {
      50: 'Halfway Hero - 50% Complete! 🎉',
      100: `${roadmap.role} Master - 100% Complete! 🏆`
    };
    
    if (milestoneMessages[percentage]) {
      const existingMilestone = progress.milestones.find(
        m => m.title === milestoneMessages[percentage]
      );
      
      if (!existingMilestone) {
        progress.milestones.push({
          title: milestoneMessages[percentage],
          achievedAt: new Date(),
          description: `Completed ${percentage}% of ${roadmap.role} roadmap`
        });
      }
    }
  }
  

// Admin: Create or update roadmap
export const createOrUpdateRoadmap = async (req, res, next) => {
  try {
    if (!req.user.isUserAdmin) {
      return next(errorHandler(403, 'Only admins can create roadmaps'));
    }
    
    const { role, nodes, title, description, difficulty } = req.body;
    
    // Calculate total estimated hours (stored as hours, displayed as days in frontend)
    const totalHours = nodes.reduce((sum, node) => {
      const nodeHours = node.learningSteps.reduce(
        (stepSum, step) => stepSum + (step.estimatedHours || 0), 
        0
      );
      return sum + nodeHours;
    }, 0);
    
    let roadmap = await Roadmap.findOne({ role });
    
    if (roadmap) {
      // Update existing
      roadmap.nodes = nodes;
      roadmap.title = title;
      roadmap.description = description;
      roadmap.difficulty = difficulty;
      roadmap.totalEstimatedHours = totalHours;
      await roadmap.save();
    } else {
      // Create new
      roadmap = await Roadmap.create({
        role,
        title,
        description,
        difficulty,
        nodes,
        totalEstimatedHours: totalHours
      });
    }
    
    res.status(200).json({
      success: true,
      data: roadmap
    });
  } catch (error) {
    next(error);
  }
};



// Add this to your existing roadmap.controller.js

export const deleteRoadmap = async (req, res, next) => {
    try {
      if (!req.user.isUserAdmin) {
        return next(errorHandler(403, 'Only admins can delete roadmaps'));
      }
  
      const { roadmapId } = req.params;
      
      const roadmap = await Roadmap.findByIdAndDelete(roadmapId);
      
      if (!roadmap) {
        return next(errorHandler(404, 'Roadmap not found'));
      }
  
      // Optionally delete all user progress associated with this roadmap
      await UserProgress.deleteMany({ roadmapId });
  
      res.status(200).json({
        success: true,
        message: 'Roadmap deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  };



