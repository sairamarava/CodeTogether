import Room from '../models/Room.js';
import File from '../models/File.js';
import Message from '../models/Message.js';
import { generateUserColor, debounce } from '../utils/helpers.js';

// Store active connections
const activeConnections = new Map();

export const handleSocketConnection = (socket, io) => {
  console.log(`🔌 User connected: ${socket.id}`);

  // Handle user joining a room
  socket.on('join-room', async (data) => {
    try {
      const { roomId, userId, username } = data;
      
      // Leave previous rooms
      const previousRooms = Array.from(socket.rooms).filter(room => room !== socket.id);
      previousRooms.forEach(room => socket.leave(room));

      // Join the new room
      socket.join(roomId);
      
      // Store connection info
      activeConnections.set(socket.id, {
        roomId,
        userId,
        username,
        joinedAt: new Date()
      });

      // Update room with active user
      const room = await Room.findOne({ roomId });
      if (room) {
        const userColor = generateUserColor();
        
        // Remove user if already exists, then add
        room.activeUsers = room.activeUsers.filter(
          user => user.user.toString() !== userId
        );
        
        room.activeUsers.push({
          user: userId,
          socketId: socket.id,
          color: userColor,
          cursor: { line: 0, column: 0 },
          lastActivity: new Date()
        });
        
        room.stats.totalConnections += 1;
        await room.save();

        // Notify other users in the room
        socket.to(roomId).emit('user-joined', {
          userId,
          username,
          color: userColor,
          socketId: socket.id
        });

        // Send current active users to the newly joined user
        const activeUsers = room.activeUsers.map(user => ({
          userId: user.user,
          socketId: user.socketId,
          color: user.color,
          cursor: user.cursor
        }));

        socket.emit('room-joined', {
          roomId,
          activeUsers,
          message: `Welcome to ${room.name}!`
        });

        console.log(`👤 User ${username} joined room ${roomId}`);
      }
    } catch (error) {
      console.error('Error joining room:', error);
      socket.emit('error', { message: 'Failed to join room' });
    }
  });

  // Handle code changes with operational transformation
  socket.on('code-change', debounce(async (data) => {
    try {
      const { roomId, fileId, content, changes, version } = data;
      const connection = activeConnections.get(socket.id);
      
      if (!connection || connection.roomId !== roomId) return;

      // Update file in database
      const file = await File.findById(fileId);
      if (file && file.roomId === roomId) {
        file.content = content;
        file.lastModifiedBy = connection.userId;
        file.size = content.length;
        await file.save();

        // Update room stats
        await Room.updateOne(
          { roomId },
          { $inc: { 'stats.totalFileChanges': 1 } }
        );

        // Broadcast changes to other users in the room
        socket.to(roomId).emit('code-change', {
          fileId,
          content,
          changes,
          version,
          userId: connection.userId,
          username: connection.username
        });
      }
    } catch (error) {
      console.error('Error handling code change:', error);
    }
  }, 1000));

  // Handle cursor position updates
  socket.on('cursor-position', debounce(async (data) => {
    try {
      const { roomId, fileId, line, column } = data;
      const connection = activeConnections.get(socket.id);
      
      if (!connection || connection.roomId !== roomId) return;

      // Update cursor position in room
      await Room.updateOne(
        { 
          roomId, 
          'activeUsers.socketId': socket.id 
        },
        { 
          $set: { 
            'activeUsers.$.cursor': { line, column },
            'activeUsers.$.lastActivity': new Date()
          } 
        }
      );

      // Broadcast cursor position to other users
      socket.to(roomId).emit('cursor-position', {
        userId: connection.userId,
        socketId: socket.id,
        fileId,
        line,
        column
      });
    } catch (error) {
      console.error('Error updating cursor position:', error);
    }
  }, 300));

  // Handle typing indicators
  socket.on('user-typing', debounce((data) => {
    const { roomId, fileId, isTyping } = data;
    const connection = activeConnections.get(socket.id);
    
    if (!connection || connection.roomId !== roomId) return;

    socket.to(roomId).emit('user-typing', {
      userId: connection.userId,
      username: connection.username,
      fileId,
      isTyping
    });
  }, 300));

  // Handle chat messages
  socket.on('chat-message', async (data) => {
    try {
      const { roomId, content, type = 'text' } = data;
      const connection = activeConnections.get(socket.id);
      
      if (!connection || connection.roomId !== roomId) return;

      // Save message to database
      const message = new Message({
        roomId,
        sender: connection.userId,
        content,
        type
      });
      await message.save();

      // Update room stats
      await Room.updateOne(
        { roomId },
        { $inc: { 'stats.totalMessages': 1 } }
      );

      // Populate sender info
      await message.populate('sender', 'username avatar');

      // Broadcast message to all users in room
      io.to(roomId).emit('chat-message', {
        _id: message._id,
        content: message.content,
        type: message.type,
        sender: message.sender,
        createdAt: message.createdAt
      });
    } catch (error) {
      console.error('Error handling chat message:', error);
    }
  });

  // Handle file operations
  socket.on('file-created', async (data) => {
    try {
      const { roomId, fileData } = data;
      const connection = activeConnections.get(socket.id);
      
      if (!connection || connection.roomId !== roomId) return;

      socket.to(roomId).emit('file-created', {
        file: fileData,
        createdBy: connection.username
      });
    } catch (error) {
      console.error('Error handling file creation:', error);
    }
  });

  socket.on('file-deleted', async (data) => {
    try {
      const { roomId, fileId, fileName } = data;
      const connection = activeConnections.get(socket.id);
      
      if (!connection || connection.roomId !== roomId) return;

      socket.to(roomId).emit('file-deleted', {
        fileId,
        fileName,
        deletedBy: connection.username
      });
    } catch (error) {
      console.error('Error handling file deletion:', error);
    }
  });

  socket.on('file-renamed', async (data) => {
    try {
      const { roomId, fileId, oldName, newName } = data;
      const connection = activeConnections.get(socket.id);
      
      if (!connection || connection.roomId !== roomId) return;

      socket.to(roomId).emit('file-renamed', {
        fileId,
        oldName,
        newName,
        renamedBy: connection.username
      });
    } catch (error) {
      console.error('Error handling file rename:', error);
    }
  });

  // Handle drawing board events
  socket.on('drawing-change', (data) => {
    const { roomId, drawingData } = data;
    const connection = activeConnections.get(socket.id);
    
    if (!connection || connection.roomId !== roomId) return;

    socket.to(roomId).emit('drawing-change', {
      drawingData,
      userId: connection.userId
    });
  });

  // Handle disconnection
  socket.on('disconnect', async () => {
    try {
      const connection = activeConnections.get(socket.id);
      
      if (connection) {
        const { roomId, userId, username } = connection;
        
        // Remove user from active users in room
        await Room.updateOne(
          { roomId },
          { 
            $pull: { 
              activeUsers: { socketId: socket.id } 
            } 
          }
        );

        // Notify other users
        socket.to(roomId).emit('user-left', {
          userId,
          username,
          socketId: socket.id
        });

        // Remove connection
        activeConnections.delete(socket.id);
        
        console.log(`👋 User ${username} disconnected from room ${roomId}`);
      }
    } catch (error) {
      console.error('Error handling disconnect:', error);
    }
  });

  // Handle errors
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
};
