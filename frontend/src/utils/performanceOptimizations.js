// Performance optimization utilities for the Home page

// Debounce function to limit API calls
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle function to limit function calls
export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Intersection Observer for lazy loading
export const createIntersectionObserver = (callback, options = {}) => {
  const defaultOptions = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1,
    ...options
  };
  
  return new IntersectionObserver(callback, defaultOptions);
};

// Preload critical resources
export const preloadCriticalResources = () => {
  // Preload critical CSS
  const criticalCSS = document.createElement('link');
  criticalCSS.rel = 'preload';
  criticalCSS.href = '/src/styles/Home.css';
  criticalCSS.as = 'style';
  document.head.appendChild(criticalCSS);
  
  // Preload critical fonts
  const fontPreload = document.createElement('link');
  fontPreload.rel = 'preload';
  fontPreload.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap';
  fontPreload.as = 'style';
  document.head.appendChild(fontPreload);
};

// Image optimization helper
export const optimizeImage = (src, width, height, quality = 80) => {
  // This would integrate with your image optimization service
  return `${src}?w=${width}&h=${height}&q=${quality}&f=webp`;
};

// Memory cleanup utility
export const cleanupMemory = () => {
  // Force garbage collection if available (development only)
  if (window.gc) {
    window.gc();
  }
  
  // Clear any cached data that's no longer needed
  if (window.performance && window.performance.memory) {
    console.log('Memory usage:', {
      used: Math.round(window.performance.memory.usedJSHeapSize / 1048576) + ' MB',
      total: Math.round(window.performance.memory.totalJSHeapSize / 1048576) + ' MB',
      limit: Math.round(window.performance.memory.jsHeapSizeLimit / 1048576) + ' MB'
    });
  }
};

// Bundle size analyzer helper
export const analyzeBundleSize = () => {
  if (import.meta.env.DEV) {
    console.log('Bundle analysis:', {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      connection: navigator.connection?.effectiveType || 'unknown'
    });
  }
};
