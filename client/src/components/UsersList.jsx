import React from "react";
import { UserIcon } from "@heroicons/react/24/outline";

const UsersList = ({ users, currentUser }) => {
  const getStatusColor = (user) => {
    if (user.id === currentUser.id) return "bg-green-500";
    return user.isActive ? "bg-green-500" : "bg-gray-500";
  };

  const getStatusText = (user) => {
    if (user.id === currentUser.id) return "You";
    return user.isActive ? "Online" : "Away";
  };

  return (
    <div className="border-b border-gray-700">
      <div className="p-3">
        <h3 className="font-semibold text-sm mb-3 flex items-center">
          <UserIcon className="w-4 h-4 mr-2" />
          Users ({users.length})
        </h3>

        <div className="space-y-2">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center space-x-3 p-2 rounded hover:bg-gray-700"
            >
              {/* Avatar */}
              <div className="relative">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                  {user.username[0].toUpperCase()}
                </div>
                {/* Status indicator */}
                <div
                  className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-gray-800 ${getStatusColor(
                    user
                  )}`}
                />
              </div>

              {/* User info */}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">
                  {user.username}
                  {user.id === currentUser.id && (
                    <span className="text-xs text-gray-400 ml-1">(You)</span>
                  )}
                </div>
                <div className="text-xs text-gray-400">
                  {getStatusText(user)}
                </div>
              </div>

              {/* Cursor indicator */}
              {user.cursorPosition && user.id !== currentUser.id && (
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
              )}
            </div>
          ))}
        </div>

        {users.length === 0 && (
          <div className="text-center text-gray-400 text-sm py-4">
            <UserIcon className="w-6 h-6 mx-auto mb-2 opacity-50" />
            <p>No users in room</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersList;
