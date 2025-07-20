import express from 'express';
import axios from 'axios';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { sanitizeInput, createRateLimiter } from '../utils/helpers.js';

const router = express.Router();

// Rate limiter for code execution (5 requests per minute per user)
const executeRateLimit = createRateLimiter(60000, 5);

// Supported languages mapping
const languageMap = {
  'javascript': { language: 'javascript', version: '18.15.0' },
  'typescript': { language: 'typescript', version: '5.0.3' },
  'python': { language: 'python', version: '3.10.0' },
  'java': { language: 'java', version: '15.0.2' },
  'cpp': { language: 'cpp', version: '10.2.0' },
  'c': { language: 'c', version: '10.2.0' },
  'csharp': { language: 'csharp', version: '6.12.0' },
  'php': { language: 'php', version: '8.2.3' },
  'ruby': { language: 'ruby', version: '3.0.1' },
  'go': { language: 'go', version: '1.16.2' },
  'rust': { language: 'rust', version: '1.68.2' },
  'swift': { language: 'swift', version: '5.3.3' },
  'kotlin': { language: 'kotlin', version: '1.8.20' },
  'scala': { language: 'scala', version: '3.2.2' },
  'r': { language: 'r', version: '4.1.1' },
  'dart': { language: 'dart', version: '2.19.6' },
  'lua': { language: 'lua', version: '5.4.4' },
  'perl': { language: 'perl', version: '5.36.0' },
  'bash': { language: 'bash', version: '5.2.0' },
  'powershell': { language: 'powershell', version: '7.1.4' }
};

// Get supported languages
router.get('/languages', (req, res) => {
  try {
    const languages = Object.keys(languageMap).map(key => ({
      id: key,
      name: key.charAt(0).toUpperCase() + key.slice(1),
      version: languageMap[key].version
    }));

    res.json({
      languages,
      total: languages.length
    });
  } catch (error) {
    console.error('Get languages error:', error);
    res.status(500).json({
      error: 'Failed to get languages',
      message: 'An error occurred while fetching supported languages'
    });
  }
});

// Execute code
router.post('/:roomId', authenticateToken, requireRole(['editor', 'admin', 'owner']), async (req, res) => {
  try {
    const { roomId } = req.params;
    const { code, language, input = '', filename = 'main' } = req.body;

    // Validate input
    if (!code || !language) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Code and language are required'
      });
    }

    // Check rate limit
    if (!executeRateLimit(req.user._id.toString())) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: 'Too many code execution requests. Please wait before trying again.'
      });
    }

    // Check if room allows code execution
    if (!req.room.settings.allowCodeExecution) {
      return res.status(403).json({
        error: 'Code execution disabled',
        message: 'Code execution is disabled for this room'
      });
    }

    // Validate language
    const langConfig = languageMap[language.toLowerCase()];
    if (!langConfig) {
      return res.status(400).json({
        error: 'Unsupported language',
        message: `Language '${language}' is not supported. Use /api/execute/languages to see supported languages.`
      });
    }

    // Sanitize code (basic protection)
    const sanitizedCode = sanitizeInput(code);
    const sanitizedInput = sanitizeInput(input);

    // Prepare request for Piston API
    const pistonRequest = {
      language: langConfig.language,
      version: langConfig.version,
      files: [
        {
          name: getFileName(filename, language),
          content: sanitizedCode
        }
      ],
      stdin: sanitizedInput,
      args: [],
      compile_timeout: 10000, // 10 seconds
      run_timeout: 3000, // 3 seconds
      compile_memory_limit: -1,
      run_memory_limit: 128000000 // 128MB
    };

    console.log(`🔄 Executing ${language} code for user ${req.user.username} in room ${roomId}`);

    // Execute code using Piston API
    const response = await axios.post(
      `${process.env.PISTON_API_URL || 'https://emkc.org/api/v2/piston'}/execute`,
      pistonRequest,
      {
        timeout: 15000, // 15 seconds total timeout
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const result = response.data;

    // Format execution result
    const executionResult = {
      language: language,
      version: langConfig.version,
      code: code,
      input: input,
      output: result.run?.stdout || '',
      error: result.run?.stderr || result.compile?.stderr || '',
      exitCode: result.run?.code || result.compile?.code || 0,
      executionTime: `${Date.now()}`,
      success: !result.run?.stderr && !result.compile?.stderr,
      compilationOutput: result.compile?.stdout || '',
      memory: result.run?.memory || 0,
      cpuTime: result.run?.cpu_time || 0
    };

    console.log(`✅ Code execution completed for user ${req.user.username}`);

    res.json({
      message: 'Code executed successfully',
      result: executionResult
    });

  } catch (error) {
    console.error('Code execution error:', error);

    if (error.code === 'ECONNABORTED' || error.timeout) {
      return res.status(408).json({
        error: 'Execution timeout',
        message: 'Code execution took too long and was terminated'
      });
    }

    if (error.response?.status === 400) {
      return res.status(400).json({
        error: 'Invalid code execution request',
        message: error.response.data?.message || 'Invalid request to code execution service'
      });
    }

    if (error.response?.status >= 500) {
      return res.status(503).json({
        error: 'Code execution service unavailable',
        message: 'The code execution service is temporarily unavailable'
      });
    }

    res.status(500).json({
      error: 'Execution failed',
      message: 'An error occurred while executing the code',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get execution history for a room (optional feature)
router.get('/:roomId/history', authenticateToken, requireRole(['viewer', 'editor', 'admin', 'owner']), async (req, res) => {
  try {
    // This could be implemented to store execution history in database
    // For now, return empty array
    res.json({
      history: [],
      message: 'Execution history feature is not yet implemented'
    });
  } catch (error) {
    console.error('Get execution history error:', error);
    res.status(500).json({
      error: 'Failed to get execution history',
      message: 'An error occurred while fetching execution history'
    });
  }
});

// Helper function to get appropriate filename for language
function getFileName(baseFilename, language) {
  const extensions = {
    'javascript': 'js',
    'typescript': 'ts',
    'python': 'py',
    'java': 'java',
    'cpp': 'cpp',
    'c': 'c',
    'csharp': 'cs',
    'php': 'php',
    'ruby': 'rb',
    'go': 'go',
    'rust': 'rs',
    'swift': 'swift',
    'kotlin': 'kt',
    'scala': 'scala',
    'r': 'r',
    'dart': 'dart',
    'lua': 'lua',
    'perl': 'pl',
    'bash': 'sh',
    'powershell': 'ps1'
  };

  const ext = extensions[language.toLowerCase()] || 'txt';
  const cleanFilename = baseFilename.replace(/\.[^/.]+$/, ''); // Remove existing extension
  return `${cleanFilename}.${ext}`;
}

export default router;
