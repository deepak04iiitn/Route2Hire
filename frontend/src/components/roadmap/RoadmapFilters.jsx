import React from 'react';
import { FaSearch, FaFilter } from 'react-icons/fa';

export default function RoadmapFilters({ searchQuery, setSearchQuery, categoryFilter, setCategoryFilter, categories }) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-8">
      <div className="flex-1 relative group">
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-indigo-400 group-focus-within:text-indigo-600 transition-colors">
          <FaSearch className="text-lg" />
        </div>
        <input
          type="text"
          placeholder="Search skills, topics, or keywords..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="
            w-full pl-12 pr-5 py-3.5 
            bg-white border-2 border-slate-200 rounded-xl
            text-slate-900 placeholder-slate-400 font-medium
            focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100
            transition-all duration-200
            hover:border-slate-300
          "
        />
      </div>

      <div className="relative sm:w-72 group">
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-emerald-400 group-focus-within:text-emerald-600 transition-colors pointer-events-none">
          <FaFilter className="text-lg" />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="
            w-full pl-12 pr-5 py-3.5 
            bg-white border-2 border-slate-200 rounded-xl
            text-slate-900 font-medium
            focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100
            transition-all duration-200 appearance-none cursor-pointer
            hover:border-slate-300
          "
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2310b981'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 1rem center',
            backgroundSize: '1.25rem'
          }}
        >
          <option value="all">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}