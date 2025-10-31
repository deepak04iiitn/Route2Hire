// Calculate overall progress - returns percentage number
export function calculateProgress(nodes, completedNodes) {
    if (!nodes || nodes.length === 0) return 0;
  
    const completedNodeIds = completedNodes?.map(n => n.nodeId) || [];
    const completed = completedNodeIds.length;
    const total = nodes.length;
    const percentage = Math.round((completed / total) * 100);
  
    return percentage; // Return just the number
  }
  
  // Calculate detailed progress - returns object with all data
  export function calculateProgressDetailed(nodes, completedNodes) {
    if (!nodes || nodes.length === 0) return { percentage: 0, completed: 0, total: 0 };
  
    const completedNodeIds = completedNodes?.map(n => n.nodeId) || [];
    const completed = completedNodeIds.length;
    const total = nodes.length;
    const percentage = Math.round((completed / total) * 100);
  
    return { percentage, completed, total };
  }
  
  // Get next recommended skill based on prerequisites
  export function getNextRecommendedSkill(nodes, completedNodes) {
    if (!nodes || !completedNodes) return null;
    
    const completedNodeIds = completedNodes.map(n => n.nodeId);
  
    return nodes
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .find(node => {
        const notCompleted = !completedNodeIds.includes(node.id);
        const prerequisitesMet = !node.prerequisites ||
          node.prerequisites.every(prereq => completedNodeIds.includes(prereq));
        return notCompleted && prerequisitesMet;
      });
  }
  
  // Calculate skill completion including subskills
  export function calculateSkillCompletion(skill, userProgress) {
    const nodeProgress = userProgress?.completedNodes.find(n => n.nodeId === skill.id);
    
    if (!nodeProgress) return 0;
    
    const totalSteps = skill.learningSteps?.length || 0;
    if (totalSteps === 0) return nodeProgress ? 100 : 0;
    
    const completedSteps = nodeProgress.completedSubskills?.length || 0;
    return Math.round((completedSteps / totalSteps) * 100);
  }
  
  // Check if skill is locked based on prerequisites
  export function isSkillLocked(skill, completedNodes) {
    if (!skill.prerequisites || skill.prerequisites.length === 0) return false;
    
    const completedNodeIds = completedNodes?.map(n => n.nodeId) || [];
    return !skill.prerequisites.every(prereq => completedNodeIds.includes(prereq));
  }
  