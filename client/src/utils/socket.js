import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'ws://localhost:3000';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
  }

  connect(token) {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      auth: {
        token
      },
      autoConnect: true
    });

    this.setupEventHandlers();
    return this.socket;
  }

  setupEventHandlers() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('🔌 Connected to server');
      this.reconnectAttempts = 0;
      this.emit('socket-connected');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 Disconnected from server:', reason);
      this.emit('socket-disconnected', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('🔌 Connection error:', error);
      this.handleReconnect();
    });

    this.socket.on('error', (error) => {
      console.error('🔌 Socket error:', error);
      this.emit('socket-error', error);
    });

    // Forward all other events to listeners
    this.socket.onAny((eventName, ...args) => {
      this.emit(eventName, ...args);
    });
  }

  handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      console.log(`🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms...`);
      
      setTimeout(() => {
        if (this.socket && !this.socket.connected) {
          this.socket.connect();
        }
      }, delay);
    } else {
      console.error('❌ Max reconnection attempts reached');
      this.emit('max-reconnect-attempts-reached');
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.listeners.clear();
    this.reconnectAttempts = 0;
  }

  // Event listener management
  on(eventName, callback) {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, new Set());
    }
    this.listeners.get(eventName).add(callback);
  }

  off(eventName, callback) {
    if (this.listeners.has(eventName)) {
      this.listeners.get(eventName).delete(callback);
    }
  }

  emit(eventName, ...args) {
    if (this.listeners.has(eventName)) {
      this.listeners.get(eventName).forEach(callback => {
        try {
          callback(...args);
        } catch (error) {
          console.error(`Error in event listener for ${eventName}:`, error);
        }
      });
    }
  }

  // Socket.io specific methods
  send(eventName, data) {
    if (this.socket?.connected) {
      this.socket.emit(eventName, data);
    } else {
      console.warn(`⚠️ Cannot send ${eventName}: Socket not connected`);
    }
  }

  // Room management
  joinRoom(roomData) {
    this.send('join-room', roomData);
  }

  leaveRoom(roomId) {
    this.send('leave-room', { roomId });
  }

  // Code collaboration
  sendCodeChange(data) {
    this.send('code-change', data);
  }

  sendCursorPosition(data) {
    this.send('cursor-position', data);
  }

  sendTypingIndicator(data) {
    this.send('user-typing', data);
  }

  // File operations
  sendFileCreated(data) {
    this.send('file-created', data);
  }

  sendFileDeleted(data) {
    this.send('file-deleted', data);
  }

  sendFileRenamed(data) {
    this.send('file-renamed', data);
  }

  // Chat
  sendChatMessage(data) {
    this.send('chat-message', data);
  }

  // Drawing
  sendDrawingChange(data) {
    this.send('drawing-change', data);
  }

  // Connection status
  isConnected() {
    return this.socket?.connected || false;
  }

  // Get socket ID
  getId() {
    return this.socket?.id;
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;
