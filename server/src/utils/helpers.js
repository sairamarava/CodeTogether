import { v4 as uuidv4 } from 'uuid';

// Generate unique room ID
export const generateRoomId = () => {
  return uuidv4().replace(/-/g, '').substring(0, 8).toUpperCase();
};

// Generate user colors for collaboration
export const generateUserColor = () => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
    '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#F7DC6F'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// Debounce function for reducing API calls
export const debounce = (func, wait, immediate) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func(...args);
  };
};

// Language detection from file extension
export const detectLanguage = (filename) => {
  const ext = filename.split('.').pop()?.toLowerCase();
  const languageMap = {
    'js': 'javascript',
    'jsx': 'javascript',
    'ts': 'typescript',
    'tsx': 'typescript',
    'py': 'python',
    'java': 'java',
    'cpp': 'cpp',
    'c': 'c',
    'cs': 'csharp',
    'php': 'php',
    'rb': 'ruby',
    'go': 'go',
    'rs': 'rust',
    'swift': 'swift',
    'kt': 'kotlin',
    'scala': 'scala',
    'html': 'html',
    'css': 'css',
    'scss': 'scss',
    'sass': 'sass',
    'less': 'less',
    'json': 'json',
    'xml': 'xml',
    'yml': 'yaml',
    'yaml': 'yaml',
    'md': 'markdown',
    'sh': 'shell',
    'bash': 'shell',
    'sql': 'sql',
    'r': 'r',
    'dart': 'dart',
    'lua': 'lua',
    'perl': 'perl'
  };
  return languageMap[ext] || 'plaintext';
};

// Get MIME type from file extension
export const getMimeType = (filename) => {
  const ext = filename.split('.').pop()?.toLowerCase();
  const mimeMap = {
    'js': 'application/javascript',
    'jsx': 'application/javascript',
    'ts': 'application/typescript',
    'tsx': 'application/typescript',
    'py': 'text/x-python',
    'java': 'text/x-java',
    'cpp': 'text/x-c++src',
    'c': 'text/x-csrc',
    'cs': 'text/x-csharp',
    'php': 'text/x-php',
    'rb': 'text/x-ruby',
    'go': 'text/x-go',
    'rs': 'text/x-rust',
    'html': 'text/html',
    'css': 'text/css',
    'scss': 'text/x-scss',
    'sass': 'text/x-sass',
    'less': 'text/x-less',
    'json': 'application/json',
    'xml': 'application/xml',
    'yml': 'text/x-yaml',
    'yaml': 'text/x-yaml',
    'md': 'text/x-markdown',
    'txt': 'text/plain'
  };
  return mimeMap[ext] || 'text/plain';
};

// Validate file name
export const isValidFileName = (filename) => {
  const invalidChars = /[<>:"/\\|?*\x00-\x1f]/;
  const reservedNames = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i;
  
  return filename &&
    filename.length > 0 &&
    filename.length <= 255 &&
    !invalidChars.test(filename) &&
    !reservedNames.test(filename) &&
    !filename.startsWith('.') &&
    !filename.endsWith('.');
};

// Generate safe file path
export const generateSafePath = (parentPath, filename) => {
  const safeName = filename.replace(/[<>:"/\\|?*\x00-\x1f]/g, '_');
  return parentPath ? `${parentPath}/${safeName}` : safeName;
};

// Format file size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Sanitize user input
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';
  return input
    .replace(/[<>]/g, '') // Remove potentially dangerous characters
    .trim()
    .substring(0, 1000); // Limit length
};

// Generate JWT token payload
export const generateTokenPayload = (user) => {
  return {
    userId: user._id,
    username: user.username,
    email: user.email
  };
};

// Check if user has permission
export const hasPermission = (userRole, requiredRole) => {
  const hierarchy = {
    'viewer': 1,
    'editor': 2,
    'admin': 3,
    'owner': 4
  };
  
  return hierarchy[userRole] >= hierarchy[requiredRole];
};

// Rate limiting helper
export const createRateLimiter = (windowMs, max) => {
  const requests = new Map();
  
  return (identifier) => {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Clean old entries
    for (const [key, timestamps] of requests.entries()) {
      const validTimestamps = timestamps.filter(time => time > windowStart);
      if (validTimestamps.length === 0) {
        requests.delete(key);
      } else {
        requests.set(key, validTimestamps);
      }
    }
    
    // Check current identifier
    const userRequests = requests.get(identifier) || [];
    const recentRequests = userRequests.filter(time => time > windowStart);
    
    if (recentRequests.length >= max) {
      return false; // Rate limit exceeded
    }
    
    recentRequests.push(now);
    requests.set(identifier, recentRequests);
    return true; // Request allowed
  };
};
