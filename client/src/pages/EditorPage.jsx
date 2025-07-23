import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { useAuthStore } from '../stores/authStore';
import { useEditorStore } from '../stores/editorStore';
import { useChatStore } from '../stores/chatStore';
import { useExecutionStore } from '../stores/executionStore';
import socketService from '../utils/socket';
import FileTree from '../components/FileTree';
import Chat from '../components/Chat';
import CodeExecution from '../components/CodeExecution';
import UsersList from '../components/UsersList';
import TopBar from '../components/TopBar';
import { toast } from 'react-hot-toast';

const EditorPage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  
  const { user, token } = useAuthStore();
  const { 
    currentFile, 
    content, 
    language,
    users,
    cursorPositions,
    isLoading,
    setContent,
    setUsers,
    addUser,
    removeUser,
    updateCursorPosition,
    setCurrentFile,
    setLanguage,
    files
  } = useEditorStore();
  
  const [sidebarWidth, setSidebarWidth] = useState(250);
  const [showChat, setShowChat] = useState(false);
  const [showExecution, setShowExecution] = useState(false);
  const [theme, setTheme] = useState('vs-dark');

  useEffect(() => {
    if (!user || !token) {
      navigate('/login');
      return;
    }

    // Initialize socket connection
    socketService.connect();
    
    // Join room
    socketService.emit('join-room', { roomId, user });

    // Socket event listeners
    socketService.on('user-joined', (userData) => {
      addUser(userData);
      toast.success(`${userData.username} joined the room`);
    });

    socketService.on('user-left', (userData) => {
      removeUser(userData.id);
      toast(`${userData.username} left the room`);
    });

    socketService.on('users-in-room', (roomUsers) => {
      setUsers(roomUsers);
    });

    socketService.on('code-change', ({ content: newContent, fileId }) => {
      if (currentFile?.id === fileId) {
        setContent(newContent);
      }
    });

    socketService.on('cursor-position', ({ userId, position, fileId }) => {
      if (currentFile?.id === fileId) {
        updateCursorPosition(userId, position);
      }
    });

    socketService.on('file-selected', ({ file, content: fileContent }) => {
      setCurrentFile(file);
      setContent(fileContent);
      setLanguage(getLanguageFromExtension(file.name));
    });

    socketService.on('error', (error) => {
      toast.error(error.message);
    });

    return () => {
      socketService.off('user-joined');
      socketService.off('user-left');
      socketService.off('users-in-room');
      socketService.off('code-change');
      socketService.off('cursor-position');
      socketService.off('file-selected');
      socketService.off('error');
      socketService.disconnect();
    };
  }, [roomId, user, token, navigate]);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Configure editor
    editor.updateOptions({
      fontSize: 14,
      fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
      lineNumbers: 'on',
      minimap: { enabled: true },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      tabSize: 2,
      insertSpaces: true,
      wordWrap: 'on',
      cursorStyle: 'line',
      renderLineHighlight: 'all',
      smoothScrolling: true,
      mouseWheelZoom: true
    });

    // Handle cursor position changes
    editor.onDidChangeCursorPosition((e) => {
      if (currentFile) {
        const position = {
          lineNumber: e.position.lineNumber,
          column: e.position.column
        };
        socketService.emit('cursor-position', {
          roomId,
          fileId: currentFile.id,
          position,
          userId: user.id
        });
      }
    });

    // Handle content changes
    editor.onDidChangeModelContent((e) => {
      if (currentFile && !isLoading) {
        const newContent = editor.getValue();
        setContent(newContent);
        
        // Debounced emit to avoid too many socket events
        clearTimeout(window.editorTimeout);
        window.editorTimeout = setTimeout(() => {
          socketService.emit('code-change', {
            roomId,
            fileId: currentFile.id,
            content: newContent,
            changes: e.changes
          });
        }, 300);
      }
    });
  };

  const getLanguageFromExtension = (filename) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    const languageMap = {
      js: 'javascript',
      jsx: 'javascript',
      ts: 'typescript',
      tsx: 'typescript',
      py: 'python',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
      cs: 'csharp',
      php: 'php',
      rb: 'ruby',
      go: 'go',
      rs: 'rust',
      swift: 'swift',
      kt: 'kotlin',
      scala: 'scala',
      html: 'html',
      css: 'css',
      scss: 'scss',
      sass: 'sass',
      less: 'less',
      json: 'json',
      xml: 'xml',
      yaml: 'yaml',
      yml: 'yaml',
      md: 'markdown',
      sql: 'sql',
      sh: 'shell',
      bash: 'shell',
      zsh: 'shell',
      ps1: 'powershell',
      dockerfile: 'dockerfile',
      gitignore: 'plaintext',
      txt: 'plaintext'
    };
    return languageMap[ext] || 'plaintext';
  };

  const handleResize = (e) => {
    const startX = e.clientX;
    const startWidth = sidebarWidth;

    const handleMouseMove = (e) => {
      const newWidth = startWidth + (e.clientX - startX);
      setSidebarWidth(Math.max(200, Math.min(500, newWidth)));
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const renderCursorDecorations = () => {
    if (!editorRef.current || !monacoRef.current) return;

    const decorations = Object.entries(cursorPositions).map(([userId, position]) => {
      const user = users.find(u => u.id === userId);
      if (!user || userId === user.id) return null;

      return {
        range: new monacoRef.current.Range(
          position.lineNumber,
          position.column,
          position.lineNumber,
          position.column
        ),
        options: {
          className: 'cursor-decoration',
          hoverMessage: { value: user.username },
          stickiness: monacoRef.current.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges
        }
      };
    }).filter(Boolean);

    editorRef.current.deltaDecorations([], decorations);
  };

  useEffect(() => {
    renderCursorDecorations();
  }, [cursorPositions, users]);

  if (!user) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white">
      {/* Top Bar */}
      <TopBar 
        roomId={roomId}
        onToggleChat={() => setShowChat(!showChat)}
        onToggleExecution={() => setShowExecution(!showExecution)}
        onThemeChange={setTheme}
        theme={theme}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div 
          className="bg-gray-800 flex flex-col border-r border-gray-700"
          style={{ width: sidebarWidth }}
        >
          {/* Users List */}
          <UsersList users={users} currentUser={user} />
          
          {/* File Tree */}
          <div className="flex-1 overflow-auto">
            <FileTree roomId={roomId} />
          </div>
        </div>

        {/* Resize Handle */}
        <div 
          className="w-1 bg-gray-700 cursor-col-resize hover:bg-blue-500 transition-colors"
          onMouseDown={handleResize}
        />

        {/* Main Editor Area */}
        <div className="flex-1 flex">
          {/* Editor */}
          <div className="flex-1 relative">
            {currentFile ? (
              <Editor
                height="100%"
                language={language}
                value={content}
                theme={theme}
                onMount={handleEditorDidMount}
                loading={
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                }
                options={{
                  selectOnLineNumbers: true,
                  roundedSelection: false,
                  readOnly: false,
                  cursorStyle: 'line',
                  automaticLayout: true,
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <div className="text-center">
                  <div className="text-6xl mb-4">📝</div>
                  <h2 className="text-xl mb-2">No file selected</h2>
                  <p>Select a file from the sidebar or create a new one</p>
                </div>
              </div>
            )}

            {/* Current File Info */}
            {currentFile && (
              <div className="absolute bottom-4 right-4 bg-gray-800 rounded px-3 py-1 text-sm">
                {currentFile.name} • {language}
              </div>
            )}
          </div>

          {/* Right Panels */}
          <div className="flex">
            {/* Chat Panel */}
            {showChat && (
              <div className="w-80 border-l border-gray-700">
                <Chat roomId={roomId} />
              </div>
            )}

            {/* Code Execution Panel */}
            {showExecution && (
              <div className="w-96 border-l border-gray-700">
                <CodeExecution 
                  code={content}
                  language={language}
                  filename={currentFile?.name}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Custom Styles for Cursor Decorations */}
      <style jsx>{`
        .cursor-decoration {
          border-left: 2px solid #3b82f6;
          animation: blink 1s infinite;
        }
        
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default EditorPage;
