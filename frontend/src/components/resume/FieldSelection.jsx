import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    CheckCircle2, 
    Circle, 
    User, 
    Target, 
    GraduationCap, 
    Code, 
    FolderOpen, 
    Briefcase, 
    Medal,
    Award,
    BookOpen, 
    Globe,
    Heart, 
    Crown,
    ArrowRight
} from 'lucide-react';

const FIELD_ICONS = {
    'Header': User,
    'Objective': Target,
    'Education': GraduationCap,
    'Technical Skills': Code,
    'Projects': FolderOpen,
    'Work Experience': Briefcase,
    'Positions of Responsibility': Medal,
    'Certifications': Award,
    'Achievements': Medal,
    'Research/Publications': BookOpen,
    'Languages': Globe,
    'Hobbies': Heart
};

const FieldSelection = ({ availableFields, onSelect }) => {
    const [selectedFields, setSelectedFields] = useState([]);

    const handleFieldToggle = (field) => {
        if (field === 'Header' && selectedFields.includes('Header') && selectedFields.length === 1) {
            return;
        }

        setSelectedFields(prev => {
            if (prev.includes(field)) {
                return prev.filter(f => f !== field);
            }
            if (prev.length < 7) {
                return [...prev, field];
            }
            return prev;
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (selectedFields.includes('Header') && selectedFields.length >= 1 && selectedFields.length <= 7) {
            onSelect(selectedFields);
        } else if (!selectedFields.includes('Header')) {
            // Using a more elegant notification instead of alert
            console.warn('Header section is compulsory.');
        } else if (selectedFields.length === 0) {
            console.warn('Please select fields for your resume.');
        } else if (selectedFields.length > 7) {
            console.warn('You can select a maximum of 7 fields.');
        }
    };

    const isSubmitDisabled = !selectedFields.includes('Header') || selectedFields.length === 0 || selectedFields.length > 7;

    return (
        <div className="w-full">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-8"
            >
                
                <p className="text-slate-600 leading-relaxed text-sm mb-6">
                    Select up to 7 sections to include in your professional resume. 
                    The Header section is mandatory and contains your contact information.
                </p>
                
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border-2 border-slate-200">
                    <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${selectedFields.length > 0 ? 'bg-blue-500' : 'bg-slate-300'} transition-colors`}></div>
                        <span className="text-slate-700 font-medium text-sm">
                            {selectedFields.length}/7 sections selected
                        </span>
                    </div>
                    <div className="flex items-center space-x-2 text-blue-600">
                        <Crown className="w-4 h-4" />
                        <span className="text-xs font-medium">Premium Builder</span>
                    </div>
                </div>
            </motion.div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                    {availableFields.map((field, index) => {
                        const Icon = FIELD_ICONS[field] || Circle;
                        const isSelected = selectedFields.includes(field);
                        const isMandatory = field === 'Header';
                        const isDisabled = !isSelected && selectedFields.length >= 7;
                        
                        return (
                            <motion.div
                                key={field}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05, duration: 0.4 }}
                                whileHover={{ scale: isDisabled ? 1 : 1.01, y: isDisabled ? 0 : -1 }}
                                whileTap={{ scale: isDisabled ? 1 : 0.99 }}
                                onClick={() => !isDisabled && handleFieldToggle(field)}
                                className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 group ${
                                    isSelected
                                        ? 'border-blue-400 bg-gradient-to-br from-blue-50 to-purple-50 shadow-lg shadow-blue-200/50'
                                        : isDisabled
                                        ? 'border-slate-200 bg-slate-50 cursor-not-allowed opacity-50'
                                        : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/50 hover:shadow-md hover:shadow-blue-100'
                                }`}
                            >
                                <div className="relative flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className={`p-2 rounded-lg transition-all duration-300 ${
                                            isSelected 
                                                ? 'bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg' 
                                                : isDisabled
                                                ? 'bg-slate-200'
                                                : 'bg-slate-100 group-hover:bg-blue-100'
                                        }`}>
                                            <Icon className={`w-4 h-4 ${
                                                isSelected ? 'text-white' : isDisabled ? 'text-slate-400' : 'text-slate-600 group-hover:text-blue-600'
                                            } transition-colors`} />
                                        </div>
                                        <div>
                                            <div className="flex items-center space-x-2">
                                                <span className={`font-medium text-sm ${
                                                    isSelected ? 'text-slate-900' : 'text-slate-700'
                                                } transition-colors`}>
                                                    {field}
                                                </span>
                                                {isMandatory && (
                                                    <span className="px-2 py-0.5 text-xs font-medium bg-red-50 text-red-600 rounded-full border border-red-200">
                                                        Required
                                                    </span>
                                                )}
                                            </div>
                                            {isMandatory && (
                                                <p className="text-xs text-slate-500 mt-0.5">
                                                    Contact information
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center">
                                        {isSelected ? (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                            >
                                                <CheckCircle2 className="w-5 h-5 text-blue-600" />
                                            </motion.div>
                                        ) : (
                                            <Circle className={`w-5 h-5 ${
                                                isDisabled ? 'text-slate-300' : 'text-slate-400 group-hover:text-blue-500'
                                            } transition-colors`} />
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    className="flex items-center justify-between"
                >
                    <div className="text-slate-600">
                        {!selectedFields.includes('Header') && (
                            <p className="text-red-600 font-medium flex items-center text-sm">
                                <Circle className="w-3 h-3 mr-2" />
                                Header section is required
                            </p>
                        )}
                        {selectedFields.length > 7 && (
                            <p className="text-red-600 font-medium flex items-center text-sm">
                                <Circle className="w-3 h-3 mr-2" />
                                Maximum 7 sections allowed
                            </p>
                        )}
                        {selectedFields.includes('Header') && selectedFields.length <= 7 && selectedFields.length > 0 && (
                            <p className="text-emerald-600 font-medium flex items-center text-sm">
                                <CheckCircle2 className="w-3 h-3 mr-2" />
                                Ready to build your resume
                            </p>
                        )}
                    </div>
                    
                    <motion.button
                        type="submit"
                        disabled={isSubmitDisabled}
                        whileHover={!isSubmitDisabled ? { scale: 1.02, y: -1 } : {}}
                        whileTap={!isSubmitDisabled ? { scale: 0.98 } : {}}
                        className={`relative px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center space-x-2 ${
                            !isSubmitDisabled
                                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40'
                                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                    >
                        {!isSubmitDisabled && (
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-30"></div>
                        )}
                        <span className="relative">Start Building</span>
                        <ArrowRight className="w-4 h-4 relative" />
                    </motion.button>
                </motion.div>
            </form>

            {/* Progress indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-6 p-4 bg-slate-50 rounded-xl border-2 border-slate-200"
            >
                <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-slate-700">Selection Progress</span>
                    <span className="text-sm font-bold text-blue-600">{selectedFields.length}/7</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(selectedFields.length / 7) * 100}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                    ></motion.div>
                </div>
            </motion.div>
        </div>
    );
};

export default FieldSelection;