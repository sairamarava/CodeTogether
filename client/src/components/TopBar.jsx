import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import {
  ChatBubbleLeftIcon,
  PlayIcon,
  SunIcon,
  MoonIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
  DocumentDuplicateIcon,
  ShareIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";

const TopBar = ({
  roomId,
  onToggleChat,
  onToggleExecution,
  onThemeChange,
  theme,
}) => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [showShareModal, setShowShareModal] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    toast.success("Room ID copied to clipboard!");
  };

  const copyRoomLink = () => {
    const roomLink = `${window.location.origin}/room/${roomId}`;
    navigator.clipboard.writeText(roomLink);
    toast.success("Room link copied to clipboard!");
  };

  const ShareModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-96 max-w-90vw">
        <h3 className="text-lg font-semibold mb-4">Share Room</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Room ID</label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={roomId}
                readOnly
                className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
              />
              <button
                onClick={copyRoomId}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm"
              >
                <DocumentDuplicateIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Room Link</label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={`${window.location.origin}/room/${roomId}`}
                readOnly
                className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
              />
              <button
                onClick={copyRoomLink}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm"
              >
                <DocumentDuplicateIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2 mt-6">
          <button
            onClick={() => setShowShareModal(false)}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-2 flex items-center justify-between">
        {/* Left Side */}
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-blue-400">Code-Together</h1>
          <div className="text-sm text-gray-400">
            Room: <span className="text-white">{roomId}</span>
          </div>
        </div>

        {/* Center - Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowShareModal(true)}
            className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
            title="Share Room"
          >
            <ShareIcon className="w-4 h-4" />
            <span>Share</span>
          </button>

          <button
            onClick={onToggleChat}
            className="p-2 hover:bg-gray-700 rounded transition-colors"
            title="Toggle Chat"
          >
            <ChatBubbleLeftIcon className="w-5 h-5" />
          </button>

          <button
            onClick={onToggleExecution}
            className="p-2 hover:bg-gray-700 rounded transition-colors"
            title="Toggle Code Execution"
          >
            <PlayIcon className="w-5 h-5" />
          </button>

          <button
            onClick={() =>
              onThemeChange(theme === "vs-dark" ? "light" : "vs-dark")
            }
            className="p-2 hover:bg-gray-700 rounded transition-colors"
            title="Toggle Theme"
          >
            {theme === "vs-dark" ? (
              <SunIcon className="w-5 h-5" />
            ) : (
              <MoonIcon className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Right Side - User Info */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 text-sm">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center font-semibold">
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <span>{user?.username}</span>
          </div>

          <button
            onClick={handleLogout}
            className="p-2 hover:bg-gray-700 rounded transition-colors text-red-400 hover:text-red-300"
            title="Logout"
          >
            <ArrowLeftOnRectangleIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {showShareModal && <ShareModal />}
    </>
  );
};

export default TopBar;
