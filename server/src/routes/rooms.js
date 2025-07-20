import express from 'express';
import Room from '../models/Room.js';
import User from '../models/User.js';
import File from '../models/File.js';
import { authenticateToken, optionalAuth, requireRole } from '../middleware/auth.js';
import { generateRoomId, sanitizeInput } from '../utils/helpers.js';

const router = express.Router();

// Create new room
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, description, isPublic = false, maxMembers = 10 } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        error: 'Room name required',
        message: 'Please provide a valid room name'
      });
    }

    const sanitizedName = sanitizeInput(name);
    const sanitizedDescription = description ? sanitizeInput(description) : '';

    // Generate unique room ID
    let roomId;
    let attempts = 0;
    do {
      roomId = generateRoomId();
      attempts++;
      if (attempts > 10) {
        throw new Error('Failed to generate unique room ID');
      }
    } while (await Room.findOne({ roomId }));

    // Create room
    const room = new Room({
      roomId,
      name: sanitizedName,
      description: sanitizedDescription,
      owner: req.user._id,
      isPublic,
      maxMembers: Math.min(Math.max(maxMembers, 1), 50),
      members: [{
        user: req.user._id,
        role: 'owner',
        joinedAt: new Date()
      }]
    });

    await room.save();

    // Create default files
    const defaultFiles = [
      {
        name: 'index.js',
        path: 'index.js',
        content: '// Welcome to Code-Together!\n// Start coding collaboratively!\n\nconsole.log("Hello, World!");',
        language: 'javascript',
        roomId: room.roomId,
        createdBy: req.user._id,
        lastModifiedBy: req.user._id
      },
      {
        name: 'README.md',
        path: 'README.md',
        content: '# Welcome to Code-Together 🚀\n\nThis is your collaborative coding space. You can:\n\n- Edit files in real-time with others\n- Chat with your team\n- Execute code in multiple languages\n- Draw and brainstorm together\n\nHappy coding! 🎉',
        language: 'markdown',
        roomId: room.roomId,
        createdBy: req.user._id,
        lastModifiedBy: req.user._id
      }
    ];

    await File.insertMany(defaultFiles);

    await room.populate('owner', 'username email');

    res.status(201).json({
      message: 'Room created successfully',
      room: {
        roomId: room.roomId,
        name: room.name,
        description: room.description,
        owner: room.owner,
        isPublic: room.isPublic,
        maxMembers: room.maxMembers,
        memberCount: room.members.length,
        createdAt: room.createdAt
      }
    });
  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({
      error: 'Failed to create room',
      message: 'An error occurred while creating the room'
    });
  }
});

// Get room details
router.get('/:roomId', optionalAuth, async (req, res) => {
  try {
    const { roomId } = req.params;

    const room = await Room.findOne({ roomId })
      .populate('owner', 'username email avatar')
      .populate('members.user', 'username email avatar isOnline');

    if (!room) {
      return res.status(404).json({
        error: 'Room not found',
        message: 'The specified room does not exist'
      });
    }

    // Check if user has access to private room
    if (!room.isPublic && req.user) {
      const isMember = room.members.some(
        member => member.user._id.toString() === req.user._id.toString()
      );
      
      if (!isMember) {
        return res.status(403).json({
          error: 'Access denied',
          message: 'This is a private room and you are not a member'
        });
      }
    } else if (!room.isPublic && !req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'Please log in to access this private room'
      });
    }

    // Get recent chat messages
    const Message = (await import('../models/Message.js')).default;
    const recentMessages = await Message.find({ roomId })
      .populate('sender', 'username avatar')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      room: {
        roomId: room.roomId,
        name: room.name,
        description: room.description,
        owner: room.owner,
        members: room.members,
        activeUsers: room.activeUsers,
        isPublic: room.isPublic,
        maxMembers: room.maxMembers,
        settings: room.settings,
        stats: room.stats,
        createdAt: room.createdAt,
        updatedAt: room.updatedAt
      },
      messages: recentMessages.reverse()
    });
  } catch (error) {
    console.error('Get room error:', error);
    res.status(500).json({
      error: 'Failed to get room',
      message: 'An error occurred while fetching room details'
    });
  }
});

// Join room
router.post('/:roomId/join', authenticateToken, async (req, res) => {
  try {
    const { roomId } = req.params;

    const room = await Room.findOne({ roomId });
    if (!room) {
      return res.status(404).json({
        error: 'Room not found',
        message: 'The specified room does not exist'
      });
    }

    // Check if already a member
    const existingMember = room.members.find(
      member => member.user.toString() === req.user._id.toString()
    );

    if (existingMember) {
      return res.status(400).json({
        error: 'Already a member',
        message: 'You are already a member of this room'
      });
    }

    // Check room capacity
    if (room.members.length >= room.maxMembers) {
      return res.status(400).json({
        error: 'Room full',
        message: 'This room has reached its maximum capacity'
      });
    }

    // Add user to room
    room.members.push({
      user: req.user._id,
      role: 'editor',
      joinedAt: new Date()
    });

    await room.save();

    res.json({
      message: 'Successfully joined room',
      room: {
        roomId: room.roomId,
        name: room.name,
        memberCount: room.members.length
      }
    });
  } catch (error) {
    console.error('Join room error:', error);
    res.status(500).json({
      error: 'Failed to join room',
      message: 'An error occurred while joining the room'
    });
  }
});

// Leave room
router.post('/:roomId/leave', authenticateToken, requireRole(['editor', 'admin', 'owner']), async (req, res) => {
  try {
    const { roomId } = req.params;
    const room = req.room;

    // Owner cannot leave room, must transfer ownership first
    if (room.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({
        error: 'Owner cannot leave',
        message: 'Room owner must transfer ownership before leaving'
      });
    }

    // Remove user from room
    room.members = room.members.filter(
      member => member.user.toString() !== req.user._id.toString()
    );

    // Remove from active users
    room.activeUsers = room.activeUsers.filter(
      user => user.user.toString() !== req.user._id.toString()
    );

    await room.save();

    res.json({
      message: 'Successfully left room'
    });
  } catch (error) {
    console.error('Leave room error:', error);
    res.status(500).json({
      error: 'Failed to leave room',
      message: 'An error occurred while leaving the room'
    });
  }
});

// Update room settings
router.patch('/:roomId/settings', authenticateToken, requireRole(['admin', 'owner']), async (req, res) => {
  try {
    const room = req.room;
    const { 
      allowFileUpload, 
      allowCodeExecution, 
      allowChat, 
      allowDrawing, 
      autoSave, 
      saveInterval 
    } = req.body;

    if (typeof allowFileUpload === 'boolean') {
      room.settings.allowFileUpload = allowFileUpload;
    }
    if (typeof allowCodeExecution === 'boolean') {
      room.settings.allowCodeExecution = allowCodeExecution;
    }
    if (typeof allowChat === 'boolean') {
      room.settings.allowChat = allowChat;
    }
    if (typeof allowDrawing === 'boolean') {
      room.settings.allowDrawing = allowDrawing;
    }
    if (typeof autoSave === 'boolean') {
      room.settings.autoSave = autoSave;
    }
    if (saveInterval && saveInterval >= 1000 && saveInterval <= 30000) {
      room.settings.saveInterval = saveInterval;
    }

    await room.save();

    res.json({
      message: 'Room settings updated successfully',
      settings: room.settings
    });
  } catch (error) {
    console.error('Update room settings error:', error);
    res.status(500).json({
      error: 'Failed to update room settings',
      message: 'An error occurred while updating room settings'
    });
  }
});

// Get user's rooms
router.get('/user/rooms', authenticateToken, async (req, res) => {
  try {
    const rooms = await Room.find({
      'members.user': req.user._id
    })
    .populate('owner', 'username email')
    .select('roomId name description isPublic members.role members.joinedAt createdAt updatedAt stats')
    .sort({ updatedAt: -1 });

    const userRooms = rooms.map(room => {
      const userMember = room.members.find(
        member => member.user.toString() === req.user._id.toString()
      );
      
      return {
        roomId: room.roomId,
        name: room.name,
        description: room.description,
        owner: room.owner,
        isPublic: room.isPublic,
        memberCount: room.members.length,
        userRole: userMember?.role,
        joinedAt: userMember?.joinedAt,
        stats: room.stats,
        createdAt: room.createdAt,
        updatedAt: room.updatedAt
      };
    });

    res.json({
      rooms: userRooms
    });
  } catch (error) {
    console.error('Get user rooms error:', error);
    res.status(500).json({
      error: 'Failed to get rooms',
      message: 'An error occurred while fetching your rooms'
    });
  }
});

// Delete room (owner only)
router.delete('/:roomId', authenticateToken, requireRole(['owner']), async (req, res) => {
  try {
    const { roomId } = req.params;
    
    // Delete all files in the room
    await File.deleteMany({ roomId });
    
    // Delete all messages in the room
    const Message = (await import('../models/Message.js')).default;
    await Message.deleteMany({ roomId });
    
    // Delete the room
    await Room.deleteOne({ roomId });

    res.json({
      message: 'Room deleted successfully'
    });
  } catch (error) {
    console.error('Delete room error:', error);
    res.status(500).json({
      error: 'Failed to delete room',
      message: 'An error occurred while deleting the room'
    });
  }
});

export default router;
