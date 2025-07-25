import React, { useState, useEffect } from "react";
import { useEditorStore } from "../stores/editorStore";
import socketService from "../utils/socket";
import api from "../utils/api";
import {
  FolderIcon,
  FolderOpenIcon,
  DocumentIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";

const FileTree = ({ roomId }) => {
  const {
    files,
    currentFile,
    setCurrentFile,
    setFiles,
    setContent,
    setLanguage,
  } = useEditorStore();
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [contextMenu, setContextMenu] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createType, setCreateType] = useState("file"); // 'file' or 'folder'
  const [createName, setCreateName] = useState("");
  const [editingFile, setEditingFile] = useState(null);
  const [editName, setEditName] = useState("");

  useEffect(() => {
    loadFiles();

    // Socket listeners for file operations
    socketService.on("file-created", (file) => {
      loadFiles();
      toast.success(`${file.type} "${file.name}" created`);
    });

    socketService.on("file-deleted", (fileId) => {
      loadFiles();
      toast.success("File deleted");
    });

    socketService.on("file-renamed", (file) => {
      loadFiles();
      toast.success(`Renamed to "${file.name}"`);
    });

    return () => {
      socketService.off("file-created");
      socketService.off("file-deleted");
      socketService.off("file-renamed");
    };
  }, [roomId]);

  const loadFiles = async () => {
    try {
      const response = await api.get(`/files/${roomId}`);
      setFiles(response.data);
    } catch (error) {
      toast.error("Failed to load files");
    }
  };

  const handleFileSelect = async (file) => {
    if (file.type === "folder") {
      toggleFolder(file.id);
      return;
    }

    try {
      const response = await api.get(`/files/${roomId}/${file.id}/content`);
      setCurrentFile(file);
      setContent(response.data.content);
      setLanguage(getLanguageFromExtension(file.name));

      // Emit to other users
      socketService.emit("file-selected", {
        roomId,
        file,
        content: response.data.content,
      });
    } catch (error) {
      toast.error("Failed to load file content");
    }
  };

  const toggleFolder = (folderId) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const handleContextMenu = (e, file) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      file,
    });
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  const createFileOrFolder = async () => {
    if (!createName.trim()) return;

    try {
      const data = {
        name: createName,
        type: createType,
        parentId:
          contextMenu?.file?.type === "folder" ? contextMenu.file.id : null,
      };

      const response = await api.post(`/files/${roomId}`, data);

      socketService.emit("file-create", {
        roomId,
        file: response.data,
      });

      setShowCreateModal(false);
      setCreateName("");
      closeContextMenu();
    } catch (error) {
      toast.error(`Failed to create ${createType}`);
    }
  };

  const deleteFile = async (file) => {
    if (!confirm(`Delete ${file.name}?`)) return;

    try {
      await api.delete(`/files/${roomId}/${file.id}`);

      socketService.emit("file-delete", {
        roomId,
        fileId: file.id,
      });

      closeContextMenu();
    } catch (error) {
      toast.error("Failed to delete file");
    }
  };

  const startRename = (file) => {
    setEditingFile(file.id);
    setEditName(file.name);
    closeContextMenu();
  };

  const finishRename = async (file) => {
    if (!editName.trim() || editName === file.name) {
      setEditingFile(null);
      return;
    }

    try {
      await api.put(`/files/${roomId}/${file.id}`, { name: editName });

      socketService.emit("file-rename", {
        roomId,
        fileId: file.id,
        newName: editName,
      });

      setEditingFile(null);
    } catch (error) {
      toast.error("Failed to rename file");
    }
  };

  const getLanguageFromExtension = (filename) => {
    const ext = filename.split(".").pop()?.toLowerCase();
    const languageMap = {
      js: "javascript",
      jsx: "javascript",
      ts: "typescript",
      tsx: "typescript",
      py: "python",
      java: "java",
      cpp: "cpp",
      c: "c",
      cs: "csharp",
      php: "php",
      rb: "ruby",
      go: "go",
      rs: "rust",
      swift: "swift",
      html: "html",
      css: "css",
      json: "json",
      md: "markdown",
    };
    return languageMap[ext] || "plaintext";
  };

  const renderFileTree = (items, level = 0) => {
    return items
      .sort((a, b) => {
        if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
        return a.name.localeCompare(b.name);
      })
      .map((file) => (
        <div key={file.id}>
          <div
            className={`flex items-center px-2 py-1 hover:bg-gray-700 cursor-pointer text-sm ${
              currentFile?.id === file.id ? "bg-blue-600" : ""
            }`}
            style={{ paddingLeft: `${level * 16 + 8}px` }}
            onClick={() => handleFileSelect(file)}
            onContextMenu={(e) => handleContextMenu(e, file)}
          >
            {file.type === "folder" ? (
              expandedFolders.has(file.id) ? (
                <FolderOpenIcon className="w-4 h-4 mr-2 text-blue-400" />
              ) : (
                <FolderIcon className="w-4 h-4 mr-2 text-blue-400" />
              )
            ) : (
              <DocumentIcon className="w-4 h-4 mr-2 text-gray-400" />
            )}

            {editingFile === file.id ? (
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={() => finishRename(file)}
                onKeyPress={(e) => e.key === "Enter" && finishRename(file)}
                className="bg-gray-600 border border-gray-500 rounded px-1 py-0.5 text-sm flex-1"
                autoFocus
              />
            ) : (
              <span className="flex-1 truncate">{file.name}</span>
            )}
          </div>

          {file.type === "folder" &&
            expandedFolders.has(file.id) &&
            file.children &&
            renderFileTree(file.children, level + 1)}
        </div>
      ));
  };

  const CreateModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-80">
        <h3 className="text-lg font-semibold mb-4">Create {createType}</h3>

        <input
          type="text"
          value={createName}
          onChange={(e) => setCreateName(e.target.value)}
          placeholder={`${createType} name`}
          className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 mb-4"
          autoFocus
          onKeyPress={(e) => e.key === "Enter" && createFileOrFolder()}
        />

        <div className="flex justify-end space-x-2">
          <button
            onClick={() => setShowCreateModal(false)}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded text-sm"
          >
            Cancel
          </button>
          <button
            onClick={createFileOrFolder}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-700">
        <h3 className="font-semibold text-sm">Files</h3>
        <div className="flex space-x-1">
          <button
            onClick={() => {
              setCreateType("file");
              setShowCreateModal(true);
            }}
            className="p-1 hover:bg-gray-700 rounded"
            title="New File"
          >
            <DocumentIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setCreateType("folder");
              setShowCreateModal(true);
            }}
            className="p-1 hover:bg-gray-700 rounded"
            title="New Folder"
          >
            <FolderIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* File Tree */}
      <div className="flex-1 overflow-auto">
        {files.length > 0 ? (
          renderFileTree(files)
        ) : (
          <div className="p-4 text-center text-gray-400 text-sm">
            <DocumentIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No files yet</p>
            <p>Create your first file or folder</p>
          </div>
        )}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed bg-gray-800 border border-gray-600 rounded shadow-lg py-1 z-50"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onMouseLeave={closeContextMenu}
        >
          <button
            onClick={() => {
              setCreateType("file");
              setShowCreateModal(true);
            }}
            className="w-full px-3 py-1 text-left hover:bg-gray-700 text-sm flex items-center"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            New File
          </button>
          <button
            onClick={() => {
              setCreateType("folder");
              setShowCreateModal(true);
            }}
            className="w-full px-3 py-1 text-left hover:bg-gray-700 text-sm flex items-center"
          >
            <FolderIcon className="w-4 h-4 mr-2" />
            New Folder
          </button>
          <hr className="border-gray-600 my-1" />
          <button
            onClick={() => startRename(contextMenu.file)}
            className="w-full px-3 py-1 text-left hover:bg-gray-700 text-sm flex items-center"
          >
            <PencilIcon className="w-4 h-4 mr-2" />
            Rename
          </button>
          <button
            onClick={() => deleteFile(contextMenu.file)}
            className="w-full px-3 py-1 text-left hover:bg-gray-700 text-sm flex items-center text-red-400"
          >
            <TrashIcon className="w-4 h-4 mr-2" />
            Delete
          </button>
        </div>
      )}

      {/* Modals */}
      {showCreateModal && <CreateModal />}

      {/* Click outside to close context menu */}
      {contextMenu && (
        <div className="fixed inset-0 z-40" onClick={closeContextMenu} />
      )}
    </div>
  );
};

export default FileTree;
