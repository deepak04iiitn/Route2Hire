import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Breadcrumb from '../components/Breadcrumb';
import RelatedLinks from '../components/RelatedLinks';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { FaPlus, FaTrash, FaSave, FaArrowLeft, FaBook, FaLightbulb, FaRocket } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function CreateRoadmap() {
  const { role } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    role: '',
    title: '',
    description: '',
    difficulty: 'Intermediate',
    nodes: []
  });

  useEffect(() => {
    if (!currentUser?.isUserAdmin) {
      toast.error('Access denied. Admin only.');
      navigate('/roadmaps');
      return;
    }
    if (role) {
      setIsEditMode(true);
      fetchRoadmapData();
    }
  }, [role, currentUser]);

  const fetchRoadmapData = async () => {
    try {
      const res = await fetch(`/backend/roadmaps/roadmaps/${encodeURIComponent(role)}`);
      const data = await res.json();
      if (data.success) {
        setFormData({
          role: data.data.role,
          title: data.data.title,
          description: data.data.description,
          difficulty: data.data.difficulty,
          nodes: data.data.nodes
        });
      }
    } catch (error) {
      console.error('Error fetching roadmap:', error);
      toast.error('Failed to load roadmap');
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addNode = () => {
    setFormData({
      ...formData,
      nodes: [
        ...formData.nodes,
        {
          id: `node-${Date.now()}`,
          label: '',
          description: '',
          icon: '',
          level: 1,
          position: { x: 0, y: 0 },
          prerequisites: [],
          learningSteps: [],
          order: formData.nodes.length,
          category: '',
          subSkills: []
        }
      ]
    });
  };

  const removeNode = (index) => {
    const newNodes = formData.nodes.filter((_, i) => i !== index);
    setFormData({ ...formData, nodes: newNodes });
  };

  const updateNode = (index, field, value) => {
    const newNodes = [...formData.nodes];
    newNodes[index] = { ...newNodes[index], [field]: value };
    setFormData({ ...formData, nodes: newNodes });
  };

  const addLearningStep = (nodeIndex) => {
    const newNodes = [...formData.nodes];
    newNodes[nodeIndex].learningSteps.push({
      title: '',
      description: '',
      resources: [],
      estimatedHours: 0,
      order: newNodes[nodeIndex].learningSteps.length
    });
    setFormData({ ...formData, nodes: newNodes });
  };

  const removeLearningStep = (nodeIndex, stepIndex) => {
    const newNodes = [...formData.nodes];
    newNodes[nodeIndex].learningSteps = newNodes[nodeIndex].learningSteps.filter((_, i) => i !== stepIndex);
    setFormData({ ...formData, nodes: newNodes });
  };

  const updateLearningStep = (nodeIndex, stepIndex, field, value) => {
    const newNodes = [...formData.nodes];
    newNodes[nodeIndex].learningSteps[stepIndex] = {
      ...newNodes[nodeIndex].learningSteps[stepIndex],
      [field]: value
    };
    setFormData({ ...formData, nodes: newNodes });
  };

  const addResource = (nodeIndex, stepIndex) => {
    const newNodes = [...formData.nodes];
    newNodes[nodeIndex].learningSteps[stepIndex].resources.push({
      resourceType: '',
      title: '',
      url: ''
    });
    setFormData({ ...formData, nodes: newNodes });
  };

  const removeResource = (nodeIndex, stepIndex, resourceIndex) => {
    const newNodes = [...formData.nodes];
    newNodes[nodeIndex].learningSteps[stepIndex].resources = 
      newNodes[nodeIndex].learningSteps[stepIndex].resources.filter((_, i) => i !== resourceIndex);
    setFormData({ ...formData, nodes: newNodes });
  };

  const updateResource = (nodeIndex, stepIndex, resourceIndex, field, value) => {
    const newNodes = [...formData.nodes];
    newNodes[nodeIndex].learningSteps[stepIndex].resources[resourceIndex] = {
      ...newNodes[nodeIndex].learningSteps[stepIndex].resources[resourceIndex],
      [field]: value
    };
    setFormData({ ...formData, nodes: newNodes });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.role || !formData.title) {
      toast.error('Role and Title are required');
      return;
    }
    if (formData.nodes.length === 0) {
      toast.error('Add at least one node');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/backend/roadmaps/admin/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        toast.success(isEditMode ? 'Roadmap updated successfully!' : 'Roadmap created successfully!');
        navigate('/roadmaps');
      } else {
        toast.error(data.message || 'Failed to save roadmap');
      }
    } catch (error) {
      console.error('Error saving roadmap:', error);
      toast.error('Failed to save roadmap');
    } finally {
      setLoading(false);
    }
  };

  const difficultyColors = {
    Beginner: 'bg-emerald-500',
    Intermediate: 'bg-blue-500',
    Advanced: 'bg-purple-500'
  };

  return (
    <>
      <Helmet>
        <title>{isEditMode ? 'Edit Roadmap' : 'Create Roadmap'} | Route2Hire</title>
      </Helmet>
      <div className="min-h-screen bg-slate-50">
      {/* Breadcrumb Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-20">
        <Breadcrumb 
          items={[
            { label: 'Roadmaps', path: '/roadmaps' },
            { label: isEditMode ? 'Edit Roadmap' : 'Create Roadmap' }
          ]}
        />
      </div>
      
      {/* Header Section */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">
                {isEditMode ? 'Edit Roadmap' : 'Create New Roadmap'}
              </h1>
              <p className="text-lg text-slate-600">
                {isEditMode ? 'Update the roadmap details and learning path' : 'Define a new learning roadmap for your users'}
              </p>
            </div>
            <FaRocket className="text-5xl text-indigo-500" />
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
          >
            <div className="bg-indigo-500 px-6 py-4 flex items-center gap-3">
              <FaBook className="text-2xl text-white" />
              <h2 className="text-xl font-semibold text-white">Basic Information</h2>
            </div>
            
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Role / Job Title *
                  </label>
                  <input
                    type="text"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    disabled={isEditMode}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all disabled:bg-slate-100 disabled:cursor-not-allowed text-slate-900"
                    placeholder="e.g., QA Engineer"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Difficulty Level *
                  </label>
                  <select
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all text-slate-900"
                    required
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                  <div className="mt-2 flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${difficultyColors[formData.difficulty]}`}>
                      {formData.difficulty}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Roadmap Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all text-slate-900"
                  placeholder="e.g., Complete QA Engineer Learning Path"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all resize-none text-slate-900"
                  placeholder="Describe what this roadmap covers..."
                />
              </div>
            </div>
          </motion.div>

          {/* Learning Nodes Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
          >
            <div className="bg-teal-500 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FaLightbulb className="text-2xl text-white" />
                <h2 className="text-xl font-semibold text-white">Learning Nodes</h2>
                <span className="bg-white text-teal-600 px-3 py-1 rounded-full text-sm font-bold">
                  {formData.nodes.length}
                </span>
              </div>
              <motion.button
                type="button"
                onClick={addNode}
                className="flex items-center gap-2 bg-white text-teal-600 px-4 py-2 rounded-lg font-semibold hover:bg-teal-50 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaPlus />
                Add Node
              </motion.button>
            </div>

            <div className="p-6 space-y-4">
              {formData.nodes.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaLightbulb className="text-3xl text-slate-400" />
                  </div>
                  <p className="text-slate-500 text-lg">No learning nodes yet</p>
                  <p className="text-slate-400 text-sm mt-1">Click "Add Node" to create your first learning milestone</p>
                </div>
              ) : (
                formData.nodes.map((node, nodeIndex) => (
                  <motion.div
                    key={nodeIndex}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="border-2 border-slate-200 rounded-xl overflow-hidden hover:border-teal-300 transition-all"
                  >
                    {/* Node Header */}
                    <div className="bg-slate-50 px-5 py-3 flex items-center justify-between border-b-2 border-slate-200">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center text-white font-bold">
                          {nodeIndex + 1}
                        </div>
                        <span className="font-semibold text-slate-700">
                          {node.label || `Node ${nodeIndex + 1}`}
                        </span>
                      </div>
                      <motion.button
                        type="button"
                        onClick={() => removeNode(nodeIndex)}
                        className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <FaTrash />
                      </motion.button>
                    </div>

                    {/* Node Content */}
                    <div className="p-5 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">
                            Label *
                          </label>
                          <input
                            type="text"
                            value={node.label}
                            onChange={(e) => updateNode(nodeIndex, 'label', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all text-slate-900"
                            placeholder="Node name"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">
                            Category
                          </label>
                          <input
                            type="text"
                            value={node.category}
                            onChange={(e) => updateNode(nodeIndex, 'category', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all text-slate-900"
                            placeholder="e.g., Testing"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">
                            Level
                          </label>
                          <input
                            type="number"
                            value={node.level}
                            onChange={(e) => updateNode(nodeIndex, 'level', parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all text-slate-900"
                            min="1"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">
                          Description
                        </label>
                        <textarea
                          value={node.description}
                          onChange={(e) => updateNode(nodeIndex, 'description', e.target.value)}
                          rows="2"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all resize-none text-slate-900"
                          placeholder="What will learners achieve?"
                        />
                      </div>

                      {/* Learning Steps */}
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-blue-900 flex items-center gap-2">
                            Learning Steps
                            <span className="bg-blue-200 text-blue-700 px-2 py-0.5 rounded-full text-xs font-bold">
                              {node.learningSteps?.length || 0}
                            </span>
                          </h4>
                          <motion.button
                            type="button"
                            onClick={() => addLearningStep(nodeIndex)}
                            className="text-blue-600 hover:bg-blue-100 px-3 py-1 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <FaPlus className="text-xs" />
                            Add Step
                          </motion.button>
                        </div>

                        {node.learningSteps?.map((step, stepIndex) => (
                          <motion.div
                            key={stepIndex}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-white rounded-lg p-4 mb-3 border border-blue-200"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                  {stepIndex + 1}
                                </div>
                                <span className="text-sm font-medium text-slate-700">Step {stepIndex + 1}</span>
                              </div>
                              <motion.button
                                type="button"
                                onClick={() => removeLearningStep(nodeIndex, stepIndex)}
                                className="text-red-500 hover:bg-red-50 p-1.5 rounded transition-colors"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <FaTrash className="text-xs" />
                              </motion.button>
                            </div>

                            <div className="space-y-3">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div className="md:col-span-2">
                                  <label className="block text-xs font-medium text-slate-600 mb-1">
                                    Step Title *
                                  </label>
                                  <input
                                    type="text"
                                    value={step.title}
                                    onChange={(e) => updateLearningStep(nodeIndex, stepIndex, 'title', e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-sm text-slate-900"
                                    placeholder="Step title"
                                    required
                                  />
                                </div>

                                <div>
                                  <label className="block text-xs font-medium text-slate-600 mb-1">
                                    Hours
                                  </label>
                                  <input
                                    type="number"
                                    value={step.estimatedHours}
                                    onChange={(e) => updateLearningStep(nodeIndex, stepIndex, 'estimatedHours', parseInt(e.target.value))}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-sm text-slate-900"
                                    min="0"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">
                                  Description
                                </label>
                                <textarea
                                  value={step.description}
                                  onChange={(e) => updateLearningStep(nodeIndex, stepIndex, 'description', e.target.value)}
                                  rows="2"
                                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all resize-none text-sm text-slate-900"
                                  placeholder="Step description"
                                />
                              </div>

                              {/* Resources */}
                              <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                                <div className="flex items-center justify-between mb-2">
                                  <h5 className="text-sm font-semibold text-purple-900 flex items-center gap-1">
                                    Resources
                                    <span className="bg-purple-200 text-purple-700 px-2 py-0.5 rounded-full text-xs font-bold">
                                      {step.resources?.length || 0}
                                    </span>
                                  </h5>
                                  <motion.button
                                    type="button"
                                    onClick={() => addResource(nodeIndex, stepIndex)}
                                    className="text-purple-600 hover:bg-purple-100 px-2 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                  >
                                    <FaPlus className="text-xs" />
                                    Add
                                  </motion.button>
                                </div>

                                {step.resources?.map((resource, resourceIndex) => (
                                  <div key={resourceIndex} className="bg-white rounded-lg p-3 mb-2 border border-purple-200">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-xs font-medium text-slate-600">Resource {resourceIndex + 1}</span>
                                      <motion.button
                                        type="button"
                                        onClick={() => removeResource(nodeIndex, stepIndex, resourceIndex)}
                                        className="text-red-500 hover:bg-red-50 p-1 rounded transition-colors"
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                      >
                                        <FaTrash className="text-xs" />
                                      </motion.button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                      <div>
                                        <input
                                          type="text"
                                          value={resource.resourceType}
                                          onChange={(e) => updateResource(nodeIndex, stepIndex, resourceIndex, 'resourceType', e.target.value)}
                                          className="w-full px-2 py-1.5 border border-slate-200 rounded focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all text-xs text-slate-900"
                                          placeholder="Type (e.g., Video)"
                                        />
                                      </div>
                                      <div>
                                        <input
                                          type="text"
                                          value={resource.title}
                                          onChange={(e) => updateResource(nodeIndex, stepIndex, resourceIndex, 'title', e.target.value)}
                                          className="w-full px-2 py-1.5 border border-slate-200 rounded focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all text-xs text-slate-900"
                                          placeholder="Title"
                                        />
                                      </div>
                                      <div>
                                        <input
                                          type="url"
                                          value={resource.url}
                                          onChange={(e) => updateResource(nodeIndex, stepIndex, resourceIndex, 'url', e.target.value)}
                                          className="w-full px-2 py-1.5 border border-slate-200 rounded focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all text-xs text-slate-900"
                                          placeholder="URL"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex justify-end gap-4"
          >
            <motion.button
              type="button"
              onClick={() => navigate('/roadmaps')}
              className="px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Cancel
            </motion.button>
            <motion.button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-indigo-500 text-white rounded-lg font-semibold hover:bg-indigo-600 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-200 flex items-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FaSave />
              {loading ? 'Saving...' : isEditMode ? 'Update Roadmap' : 'Create Roadmap'}
            </motion.button>
          </motion.div>
        </form>
        
        {/* Related Links Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-20">
          <RelatedLinks type="general" />
        </div>
      </div>
      </div>
    </>
  );
}
