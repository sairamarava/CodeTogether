import { create } from 'zustand';

export const useChatStore = create((set, get) => ({
  messages: [],
  isLoading: false,
  error: null,
  isTyping: false,
  typingUsers: [],
  
  // Actions
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message]
  })),
  
  setMessages: (messages) => set({ messages }),
  
  addMessages: (newMessages) => set((state) => ({
    messages: [...state.messages, ...newMessages]
  })),
  
  updateMessage: (messageId, updates) => set((state) => ({
    messages: state.messages.map(msg => 
      msg._id === messageId ? { ...msg, ...updates } : msg
    )
  })),
  
  removeMessage: (messageId) => set((state) => ({
    messages: state.messages.filter(msg => msg._id !== messageId)
  })),
  
  setIsLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error }),
  
  clearError: () => set({ error: null }),
  
  // Typing indicators
  setIsTyping: (isTyping) => set({ isTyping }),
  
  addTypingUser: (user) => set((state) => ({
    typingUsers: state.typingUsers.find(u => u.userId === user.userId)
      ? state.typingUsers
      : [...state.typingUsers, user]
  })),
  
  removeTypingUser: (userId) => set((state) => ({
    typingUsers: state.typingUsers.filter(u => u.userId !== userId)
  })),
  
  clearTypingUsers: () => set({ typingUsers: [] }),
  
  // Clear all
  reset: () => set({
    messages: [],
    isLoading: false,
    error: null,
    isTyping: false,
    typingUsers: []
  })
}));
