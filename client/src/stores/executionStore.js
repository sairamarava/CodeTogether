import { create } from 'zustand';

export const useExecutionStore = create((set, get) => ({
  // Execution state
  isExecuting: false,
  result: null,
  history: [],
  error: null,
  
  // Settings
  selectedLanguage: 'javascript',
  input: '',
  
  // Supported languages
  languages: [
    { id: 'javascript', name: 'JavaScript', version: '18.15.0' },
    { id: 'typescript', name: 'TypeScript', version: '5.0.3' },
    { id: 'python', name: 'Python', version: '3.10.0' },
    { id: 'java', name: 'Java', version: '15.0.2' },
    { id: 'cpp', name: 'C++', version: '10.2.0' },
    { id: 'c', name: 'C', version: '10.2.0' },
    { id: 'csharp', name: 'C#', version: '6.12.0' },
    { id: 'php', name: 'PHP', version: '8.2.3' },
    { id: 'ruby', name: 'Ruby', version: '3.0.1' },
    { id: 'go', name: 'Go', version: '1.16.2' },
    { id: 'rust', name: 'Rust', version: '1.68.2' },
    { id: 'swift', name: 'Swift', version: '5.3.3' },
    { id: 'kotlin', name: 'Kotlin', version: '1.8.20' },
    { id: 'scala', name: 'Scala', version: '3.2.2' },
    { id: 'r', name: 'R', version: '4.1.1' },
    { id: 'dart', name: 'Dart', version: '2.19.6' },
    { id: 'lua', name: 'Lua', version: '5.4.4' },
    { id: 'perl', name: 'Perl', version: '5.36.0' },
    { id: 'bash', name: 'Bash', version: '5.2.0' },
    { id: 'powershell', name: 'PowerShell', version: '7.1.4' }
  ],
  
  // Actions
  setIsExecuting: (isExecuting) => set({ isExecuting }),
  
  setResult: (result) => set({ result }),
  
  addToHistory: (execution) => set((state) => ({
    history: [execution, ...state.history.slice(0, 49)] // Keep last 50
  })),
  
  clearHistory: () => set({ history: [] }),
  
  setError: (error) => set({ error }),
  
  clearError: () => set({ error: null }),
  
  setSelectedLanguage: (language) => set({ selectedLanguage: language }),
  
  setInput: (input) => set({ input }),
  
  // Execute code
  executeCode: async (code, language, input, roomId) => {
    set({ isExecuting: true, error: null });
    
    try {
      const api = (await import('../utils/api')).default;
      
      const response = await api.post(`/execute/${roomId}`, {
        code,
        language,
        input,
        filename: 'main'
      });
      
      const result = response.data.result;
      
      // Add to history
      const execution = {
        id: Date.now(),
        code,
        language,
        input,
        result,
        timestamp: new Date().toISOString()
      };
      
      set((state) => ({
        result,
        history: [execution, ...state.history.slice(0, 49)],
        isExecuting: false
      }));
      
      return { success: true, result };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Execution failed';
      set({ 
        error: errorMessage, 
        isExecuting: false,
        result: null 
      });
      return { success: false, error: errorMessage };
    }
  },
  
  // Get language by file extension
  getLanguageFromExtension: (filename) => {
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
      'r': 'r',
      'dart': 'dart',
      'lua': 'lua',
      'pl': 'perl',
      'sh': 'bash',
      'ps1': 'powershell'
    };
    return languageMap[ext] || 'javascript';
  },
  
  // Reset store
  reset: () => set({
    isExecuting: false,
    result: null,
    error: null,
    selectedLanguage: 'javascript',
    input: ''
  })
}));
