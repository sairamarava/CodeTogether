import express from 'express';
import File from '../models/File.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { 
  detectLanguage, 
  getMimeType, 
  isValidFileName, 
  generateSafePath, 
  formatFileSize,
  sanitizeInput 
} from '../utils/helpers.js';

const router = express.Router();

// Get all files in a room
router.get('/:roomId', authenticateToken, requireRole(['viewer', 'editor', 'admin', 'owner']), async (req, res) => {
  try {
    const { roomId } = req.params;
    
    const files = await File.find({ roomId })
      .populate('createdBy', 'username')
      .populate('lastModifiedBy', 'username')
      .sort({ isFolder: -1, name: 1 }); // Folders first, then files alphabetically

    // Build file tree structure
    const fileTree = buildFileTree(files);

    res.json({
      files: fileTree,
      totalFiles: files.filter(f => !f.isFolder).length,
      totalFolders: files.filter(f => f.isFolder).length,
      totalSize: files.reduce((sum, file) => sum + (file.size || 0), 0)
    });
  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({
      error: 'Failed to get files',
      message: 'An error occurred while fetching files'
    });
  }
});

// Get specific file content
router.get('/:roomId/file/:fileId', authenticateToken, requireRole(['viewer', 'editor', 'admin', 'owner']), async (req, res) => {
  try {
    const { roomId, fileId } = req.params;
    
    const file = await File.findOne({ _id: fileId, roomId })
      .populate('createdBy', 'username avatar')
      .populate('lastModifiedBy', 'username avatar');

    if (!file) {
      return res.status(404).json({
        error: 'File not found',
        message: 'The specified file does not exist'
      });
    }

    res.json({
      file: {
        _id: file._id,
        name: file.name,
        path: file.path,
        content: file.content,
        language: file.language,
        isFolder: file.isFolder,
        size: file.size,
        mimeType: file.mimeType,
        createdBy: file.createdBy,
        lastModifiedBy: file.lastModifiedBy,
        createdAt: file.createdAt,
        updatedAt: file.updatedAt
      }
    });
  } catch (error) {
    console.error('Get file error:', error);
    res.status(500).json({
      error: 'Failed to get file',
      message: 'An error occurred while fetching the file'
    });
  }
});

// Create new file or folder
router.post('/:roomId', authenticateToken, requireRole(['editor', 'admin', 'owner']), async (req, res) => {
  try {
    const { roomId } = req.params;
    const { name, content = '', isFolder = false, parentId = null } = req.body;

    if (!name || !isValidFileName(name)) {
      return res.status(400).json({
        error: 'Invalid file name',
        message: 'Please provide a valid file name'
      });
    }

    const sanitizedName = sanitizeInput(name);
    
    // Generate path
    let parentPath = '';
    if (parentId) {
      const parentFile = await File.findOne({ _id: parentId, roomId, isFolder: true });
      if (!parentFile) {
        return res.status(400).json({
          error: 'Invalid parent folder',
          message: 'The specified parent folder does not exist'
        });
      }
      parentPath = parentFile.path;
    }

    const filePath = generateSafePath(parentPath, sanitizedName);

    // Check if file already exists
    const existingFile = await File.findOne({ roomId, path: filePath });
    if (existingFile) {
      return res.status(409).json({
        error: 'File already exists',
        message: 'A file with this name already exists in the specified location'
      });
    }

    // Create file
    const file = new File({
      name: sanitizedName,
      path: filePath,
      content: isFolder ? '' : sanitizeInput(content),
      language: isFolder ? '' : detectLanguage(sanitizedName),
      isFolder,
      parentId,
      roomId,
      createdBy: req.user._id,
      lastModifiedBy: req.user._id,
      size: isFolder ? 0 : content.length,
      mimeType: isFolder ? 'folder' : getMimeType(sanitizedName)
    });

    await file.save();
    await file.populate('createdBy', 'username');

    res.status(201).json({
      message: `${isFolder ? 'Folder' : 'File'} created successfully`,
      file: {
        _id: file._id,
        name: file.name,
        path: file.path,
        content: file.content,
        language: file.language,
        isFolder: file.isFolder,
        parentId: file.parentId,
        size: file.size,
        mimeType: file.mimeType,
        createdBy: file.createdBy,
        createdAt: file.createdAt
      }
    });
  } catch (error) {
    console.error('Create file error:', error);
    res.status(500).json({
      error: 'Failed to create file',
      message: 'An error occurred while creating the file'
    });
  }
});

// Update file content
router.put('/:roomId/file/:fileId', authenticateToken, requireRole(['editor', 'admin', 'owner']), async (req, res) => {
  try {
    const { roomId, fileId } = req.params;
    const { content, name } = req.body;

    const file = await File.findOne({ _id: fileId, roomId });
    if (!file) {
      return res.status(404).json({
        error: 'File not found',
        message: 'The specified file does not exist'
      });
    }

    if (file.isFolder) {
      return res.status(400).json({
        error: 'Cannot update folder content',
        message: 'Folders do not have content to update'
      });
    }

    // Update content
    if (content !== undefined) {
      file.content = sanitizeInput(content);
      file.size = file.content.length;
    }

    // Update name if provided
    if (name && name !== file.name) {
      if (!isValidFileName(name)) {
        return res.status(400).json({
          error: 'Invalid file name',
          message: 'Please provide a valid file name'
        });
      }

      const sanitizedName = sanitizeInput(name);
      const newPath = file.path.replace(file.name, sanitizedName);
      
      // Check if new name conflicts
      const existingFile = await File.findOne({ 
        roomId, 
        path: newPath, 
        _id: { $ne: fileId } 
      });
      
      if (existingFile) {
        return res.status(409).json({
          error: 'File name conflict',
          message: 'A file with this name already exists'
        });
      }

      file.name = sanitizedName;
      file.path = newPath;
      file.language = detectLanguage(sanitizedName);
      file.mimeType = getMimeType(sanitizedName);
    }

    file.lastModifiedBy = req.user._id;
    await file.save();

    await file.populate('lastModifiedBy', 'username');

    res.json({
      message: 'File updated successfully',
      file: {
        _id: file._id,
        name: file.name,
        path: file.path,
        content: file.content,
        language: file.language,
        size: file.size,
        mimeType: file.mimeType,
        lastModifiedBy: file.lastModifiedBy,
        updatedAt: file.updatedAt
      }
    });
  } catch (error) {
    console.error('Update file error:', error);
    res.status(500).json({
      error: 'Failed to update file',
      message: 'An error occurred while updating the file'
    });
  }
});

// Delete file or folder
router.delete('/:roomId/file/:fileId', authenticateToken, requireRole(['editor', 'admin', 'owner']), async (req, res) => {
  try {
    const { roomId, fileId } = req.params;

    const file = await File.findOne({ _id: fileId, roomId });
    if (!file) {
      return res.status(404).json({
        error: 'File not found',
        message: 'The specified file does not exist'
      });
    }

    // If it's a folder, delete all files inside it
    if (file.isFolder) {
      await File.deleteMany({ 
        roomId, 
        path: { $regex: `^${file.path}/` } 
      });
    }

    await File.deleteOne({ _id: fileId });

    res.json({
      message: `${file.isFolder ? 'Folder' : 'File'} deleted successfully`,
      deletedFile: {
        _id: file._id,
        name: file.name,
        path: file.path,
        isFolder: file.isFolder
      }
    });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({
      error: 'Failed to delete file',
      message: 'An error occurred while deleting the file'
    });
  }
});

// Rename file or folder
router.patch('/:roomId/file/:fileId/rename', authenticateToken, requireRole(['editor', 'admin', 'owner']), async (req, res) => {
  try {
    const { roomId, fileId } = req.params;
    const { newName } = req.body;

    if (!newName || !isValidFileName(newName)) {
      return res.status(400).json({
        error: 'Invalid file name',
        message: 'Please provide a valid file name'
      });
    }

    const file = await File.findOne({ _id: fileId, roomId });
    if (!file) {
      return res.status(404).json({
        error: 'File not found',
        message: 'The specified file does not exist'
      });
    }

    const sanitizedName = sanitizeInput(newName);
    const oldPath = file.path;
    const newPath = file.path.replace(file.name, sanitizedName);

    // Check if new name conflicts
    const existingFile = await File.findOne({ 
      roomId, 
      path: newPath, 
      _id: { $ne: fileId } 
    });
    
    if (existingFile) {
      return res.status(409).json({
        error: 'File name conflict',
        message: 'A file with this name already exists'
      });
    }

    // Update file
    file.name = sanitizedName;
    file.path = newPath;
    if (!file.isFolder) {
      file.language = detectLanguage(sanitizedName);
      file.mimeType = getMimeType(sanitizedName);
    }
    file.lastModifiedBy = req.user._id;
    await file.save();

    // If it's a folder, update all child paths
    if (file.isFolder) {
      await File.updateMany(
        { 
          roomId, 
          path: { $regex: `^${oldPath}/` } 
        },
        {
          $set: {
            path: { $concat: [newPath, { $substr: ['$path', oldPath.length, -1] }] }
          }
        }
      );
    }

    res.json({
      message: `${file.isFolder ? 'Folder' : 'File'} renamed successfully`,
      file: {
        _id: file._id,
        name: file.name,
        path: file.path,
        oldPath,
        isFolder: file.isFolder
      }
    });
  } catch (error) {
    console.error('Rename file error:', error);
    res.status(500).json({
      error: 'Failed to rename file',
      message: 'An error occurred while renaming the file'
    });
  }
});

// Build file tree structure from flat array
function buildFileTree(files) {
  const tree = [];
  const fileMap = new Map();

  // Create map for quick lookup
  files.forEach(file => {
    fileMap.set(file._id.toString(), {
      ...file.toObject(),
      children: []
    });
  });

  // Build tree structure
  files.forEach(file => {
    const fileNode = fileMap.get(file._id.toString());
    
    if (file.parentId) {
      const parent = fileMap.get(file.parentId.toString());
      if (parent) {
        parent.children.push(fileNode);
      } else {
        tree.push(fileNode); // Orphaned file
      }
    } else {
      tree.push(fileNode);
    }
  });

  return tree;
}

export default router;
