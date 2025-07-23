import React, { useState, useEffect } from 'react';
import { useExecutionStore } from '../stores/executionStore';
import { 
  PlayIcon, 
  StopIcon, 
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

const CodeExecution = ({ code, language, filename }) => {
  const { 
    isExecuting, 
    output, 
    error, 
    executionTime,
    executeCode,
    clearOutput 
  } = useExecutionStore();
  
  const [selectedLanguage, setSelectedLanguage] = useState(language || 'javascript');
  const [input, setInput] = useState('');

  // Language mappings for Piston API
  const languageVersions = {
    javascript: { language: 'javascript', version: '18.15.0' },
    typescript: { language: 'typescript', version: '5.0.3' },
    python: { language: 'python', version: '3.10.0' },
    java: { language: 'java', version: '15.0.2' },
    cpp: { language: 'cpp', version: '10.2.0' },
    c: { language: 'c', version: '10.2.0' },
    csharp: { language: 'csharp', version: '6.12.0' },
    php: { language: 'php', version: '8.2.3' },
    ruby: { language: 'ruby', version: '3.0.1' },
    go: { language: 'go', version: '1.16.2' },
    rust: { language: 'rust', version: '1.68.2' },
    swift: { language: 'swift', version: '5.3.3' },
    kotlin: { language: 'kotlin', version: '1.8.20' },
    scala: { language: 'scala', version: '3.2.2' }
  };

  useEffect(() => {
    if (language && languageVersions[language]) {
      setSelectedLanguage(language);
    }
  }, [language]);

  const handleExecute = async () => {
    if (!code || !code.trim()) {
      toast.error('No code to execute');
      return;
    }

    const languageConfig = languageVersions[selectedLanguage];
    if (!languageConfig) {
      toast.error('Unsupported language');
      return;
    }

    try {
      await executeCode({
        language: languageConfig.language,
        version: languageConfig.version,
        files: [{
          name: filename || `main.${getFileExtension(selectedLanguage)}`,
          content: code
        }],
        stdin: input,
        args: [],
        compile_timeout: 10000,
        run_timeout: 3000,
        compile_memory_limit: -1,
        run_memory_limit: -1
      });
    } catch (error) {
      toast.error('Execution failed');
    }
  };

  const getFileExtension = (lang) => {
    const extensions = {
      javascript: 'js',
      typescript: 'ts',
      python: 'py',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
      csharp: 'cs',
      php: 'php',
      ruby: 'rb',
      go: 'go',
      rust: 'rs',
      swift: 'swift',
      kotlin: 'kt',
      scala: 'scala'
    };
    return extensions[lang] || 'txt';
  };

  const getLanguageIcon = (lang) => {
    const icons = {
      javascript: '🟨',
      typescript: '🔷',
      python: '🐍',
      java: '☕',
      cpp: '⚡',
      c: '⚙️',
      csharp: '🔵',
      php: '🐘',
      ruby: '💎',
      go: '🐹',
      rust: '🦀',
      swift: '🍃',
      kotlin: '🎯',
      scala: '🔺'
    };
    return icons[lang] || '📄';
  };

  return (
    <div className="h-full flex flex-col bg-gray-800">
      {/* Header */}
      <div className="p-3 border-b border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm">Code Execution</h3>
          <button
            onClick={clearOutput}
            className="text-xs text-gray-400 hover:text-white"
          >
            Clear
          </button>
        </div>

        {/* Language Selector */}
        <div className="mb-3">
          <label className="block text-xs text-gray-400 mb-1">Language</label>
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
          >
            {Object.keys(languageVersions).map(lang => (
              <option key={lang} value={lang}>
                {getLanguageIcon(lang)} {lang.charAt(0).toUpperCase() + lang.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Input */}
        <div className="mb-3">
          <label className="block text-xs text-gray-400 mb-1">Standard Input</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Input for your program..."
            className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm resize-none"
            rows="2"
          />
        </div>

        {/* Execute Button */}
        <button
          onClick={handleExecute}
          disabled={isExecuting || !code}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded text-sm transition-colors"
        >
          {isExecuting ? (
            <>
              <StopIcon className="w-4 h-4 animate-spin" />
              <span>Executing...</span>
            </>
          ) : (
            <>
              <PlayIcon className="w-4 h-4" />
              <span>Run Code</span>
            </>
          )}
        </button>
      </div>

      {/* Output */}
      <div className="flex-1 overflow-auto">
        {(output || error) && (
          <div className="p-3">
            {/* Execution Info */}
            {executionTime !== null && (
              <div className="flex items-center space-x-2 mb-2 text-xs text-gray-400">
                <ClockIcon className="w-3 h-3" />
                <span>Executed in {executionTime}ms</span>
                {!error && (
                  <CheckCircleIcon className="w-3 h-3 text-green-400" />
                )}
              </div>
            )}

            {/* Error Output */}
            {error && (
              <div className="mb-3">
                <div className="flex items-center space-x-2 mb-2">
                  <ExclamationTriangleIcon className="w-4 h-4 text-red-400" />
                  <span className="text-sm font-medium text-red-400">Error</span>
                </div>
                <pre className="bg-red-900 bg-opacity-20 border border-red-700 rounded p-3 text-sm text-red-300 overflow-auto">
                  {error}
                </pre>
              </div>
            )}

            {/* Standard Output */}
            {output && (
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-sm font-medium text-green-400">Output</span>
                </div>
                <pre className="bg-gray-900 border border-gray-600 rounded p-3 text-sm text-gray-300 overflow-auto whitespace-pre-wrap">
                  {output}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!output && !error && !isExecuting && (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 text-center p-6">
            <PlayIcon className="w-12 h-12 mb-4 opacity-50" />
            <h4 className="text-lg font-medium mb-2">Ready to Execute</h4>
            <p className="text-sm">
              Write your code and click "Run Code" to see the output here.
            </p>
            <div className="mt-4 text-xs">
              <p>Supported features:</p>
              <ul className="mt-1 space-y-1">
                <li>• Standard input/output</li>
                <li>• Error handling</li>
                <li>• Execution timing</li>
                <li>• 14+ programming languages</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-gray-700 text-xs text-gray-400 text-center">
        Powered by Piston API
      </div>
    </div>
  );
};

export default CodeExecution;
