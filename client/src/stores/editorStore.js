import { create } from 'zustand';

export const useEditorStore = create((set, get) => ({
  // Editor state
  activeFile: null,
  files: [],
  openTabs: [],
  fileTree: [],
  isLoading: false,
  error: null,
  
  // Editor settings
  theme: 'vs-dark',
  fontSize: 14,
  fontFamily: 'Monaco',
  wordWrap: true,
  minimap: { enabled: true },
  
  // Collaboration state
  activeUsers: [],
  cursors: new Map(),
  selections: new Map(),
  isTyping: false,
  
  // Room state
  roomInfo: null,
  isConnected: false,
  
  // Actions
  setActiveFile: (file) => set({ activeFile: file }),
  
  setFiles: (files) => set({ files }),
  
  addFile: (file) => set((state) => ({
    files: [...state.files, file]
  })),
  
  updateFile: (fileId, updates) => set((state) => ({
    files: state.files.map(file => 
      file._id === fileId ? { ...file, ...updates } : file
    ),
    activeFile: state.activeFile?._id === fileId 
      ? { ...state.activeFile, ...updates } 
      : state.activeFile
  })),
  
  removeFile: (fileId) => set((state) => ({
    files: state.files.filter(file => file._id !== fileId),
    openTabs: state.openTabs.filter(tab => tab._id !== fileId),
    activeFile: state.activeFile?._id === fileId ? null : state.activeFile
  })),
  
  setFileTree: (tree) => set({ fileTree: tree }),
  
  // Tab management
  openTab: (file) => set((state) => {
    const existingTab = state.openTabs.find(tab => tab._id === file._id);
    if (existingTab) {
      return { activeFile: file };
    }
    return {
      openTabs: [...state.openTabs, file],
      activeFile: file
    };
  }),
  
  closeTab: (fileId) => set((state) => {
    const newTabs = state.openTabs.filter(tab => tab._id !== fileId);
    const wasActive = state.activeFile?._id === fileId;
    
    return {
      openTabs: newTabs,
      activeFile: wasActive && newTabs.length > 0 
        ? newTabs[newTabs.length - 1] 
        : wasActive ? null : state.activeFile
    };
  }),
  
  // Editor settings
  updateEditorSettings: (settings) => set((state) => ({
    ...state,
    ...settings
  })),
  
  setTheme: (theme) => set({ theme }),
  
  setFontSize: (fontSize) => set({ fontSize }),
  
  setFontFamily: (fontFamily) => set({ fontFamily }),
  
  // Collaboration
  setActiveUsers: (users) => set({ activeUsers: users }),
  
  addActiveUser: (user) => set((state) => ({
    activeUsers: [...state.activeUsers.filter(u => u.userId !== user.userId), user]
  })),
  
  removeActiveUser: (userId) => set((state) => ({
    activeUsers: state.activeUsers.filter(u => u.userId !== userId)
  })),
  
  updateUserCursor: (userId, cursor) => set((state) => {
    const newCursors = new Map(state.cursors);
    newCursors.set(userId, cursor);
    return { cursors: newCursors };
  }),
  
  updateUserSelection: (userId, selection) => set((state) => {
    const newSelections = new Map(state.selections);
    newSelections.set(userId, selection);
    return { selections: newSelections };
  }),
  
  setIsTyping: (isTyping) => set({ isTyping }),
  
  // Room
  setRoomInfo: (roomInfo) => set({ roomInfo }),
  
  setIsConnected: (isConnected) => set({ isConnected }),
  
  // Error handling
  setError: (error) => set({ error }),
  
  clearError: () => set({ error: null }),
  
  setIsLoading: (isLoading) => set({ isLoading }),
  
  // Reset store
  reset: () => set({
    activeFile: null,
    files: [],
    openTabs: [],
    fileTree: [],
    isLoading: false,
    error: null,
    activeUsers: [],
    cursors: new Map(),
    selections: new Map(),
    isTyping: false,
    roomInfo: null,
    isConnected: false
  })
}));
