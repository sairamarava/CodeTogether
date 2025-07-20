import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { 
  Code2, 
  Users, 
  Zap, 
  Globe, 
  Plus, 
  LogIn, 
  Github,
  Star,
  MessageCircle,
  Palette,
  Play
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';

const HomePage = () => {
  const navigate = useNavigate();
  const { user, token } = useAuthStore();
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [joinRoomId, setJoinRoomId] = useState('');
  const [userRooms, setUserRooms] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [roomData, setRoomData] = useState({
    name: '',
    description: '',
    isPublic: false,
    maxMembers: 10
  });

  useEffect(() => {
    if (user && token) {
      fetchUserRooms();
    }
  }, [user, token]);

  const fetchUserRooms = async () => {
    try {
      const response = await api.get('/rooms/user/rooms');
      setUserRooms(response.data.rooms);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!token) {
      navigate('/login');
      return;
    }

    setIsCreatingRoom(true);
    try {
      const response = await api.post('/rooms', roomData);
      const { roomId } = response.data.room;
      
      toast.success('Room created successfully!');
      navigate(`/room/${roomId}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create room');
    } finally {
      setIsCreatingRoom(false);
      setShowCreateModal(false);
    }
  };

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (!joinRoomId.trim()) {
      toast.error('Please enter a room ID');
      return;
    }
    navigate(`/room/${joinRoomId.trim()}`);
  };

  const features = [
    {
      icon: <Code2 className="w-8 h-8 text-blue-500" />,
      title: "Real-time Collaboration",
      description: "Code together with your team in real-time with live cursors and instant synchronization."
    },
    {
      icon: <Users className="w-8 h-8 text-green-500" />,
      title: "Multi-user Support",
      description: "Support for up to 50 users per room with role-based permissions and user management."
    },
    {
      icon: <Zap className="w-8 h-8 text-yellow-500" />,
      title: "Code Execution",
      description: "Execute code in 40+ programming languages with instant results and error handling."
    },
    {
      icon: <MessageCircle className="w-8 h-8 text-purple-500" />,
      title: "Live Chat",
      description: "Communicate with your team through real-time chat while coding together."
    },
    {
      icon: <Palette className="w-8 h-8 text-pink-500" />,
      title: "Drawing Board",
      description: "Collaborate visually with an integrated whiteboard for brainstorming and planning."
    },
    {
      icon: <Globe className="w-8 h-8 text-indigo-500" />,
      title: "Web-based",
      description: "No installation required. Works directly in your browser with modern features."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Code2 className="w-8 h-8 text-blue-500" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Code-Together
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Welcome, {user.username}
                  </span>
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Code Together,
            <span className="text-blue-500"> Build Better</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto">
            A real-time collaborative code editor that enables multiple developers to work together seamlessly. 
            Edit code, chat, execute programs, and brainstorm - all in one place.
          </p>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center justify-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-medium transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Create New Room</span>
            </button>
            
            <form onSubmit={handleJoinRoom} className="flex">
              <input
                type="text"
                placeholder="Enter Room ID"
                value={joinRoomId}
                onChange={(e) => setJoinRoomId(e.target.value)}
                className="px-4 py-4 border border-gray-300 dark:border-gray-600 rounded-l-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="bg-gray-800 hover:bg-gray-900 dark:bg-gray-600 dark:hover:bg-gray-500 text-white px-6 py-4 rounded-r-lg transition-colors"
              >
                Join Room
              </button>
            </form>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-500 mb-2">40+</div>
              <div className="text-gray-600 dark:text-gray-300">Programming Languages</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-500 mb-2">50</div>
              <div className="text-gray-600 dark:text-gray-300">Max Users per Room</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-500 mb-2">Real-time</div>
              <div className="text-gray-600 dark:text-gray-300">Collaboration</div>
            </div>
          </div>
        </div>
      </section>

      {/* User Rooms Section */}
      {user && userRooms.length > 0 && (
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800">
          <div className="max-w-6xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Your Rooms</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userRooms.map((room) => (
                <div
                  key={room.roomId}
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 dark:border-gray-600"
                  onClick={() => navigate(`/room/${room.roomId}`)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                      {room.name}
                    </h4>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      room.userRole === 'owner' 
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-300'
                    }`}>
                      {room.userRole}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                    {room.description || 'No description provided'}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <span>{room.memberCount} members</span>
                    <span>{new Date(room.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Powerful Features for Team Collaboration
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Everything you need to code collaboratively with your team, from real-time editing to code execution.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
              >
                <div className="mb-4">{feature.icon}</div>
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h4>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Create Room Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Create New Room
            </h3>
            <form onSubmit={handleCreateRoom} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Room Name
                </label>
                <input
                  type="text"
                  required
                  value={roomData.name}
                  onChange={(e) => setRoomData({ ...roomData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="My Coding Room"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={roomData.description}
                  onChange={(e) => setRoomData({ ...roomData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief description of your room"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Max Members
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={roomData.maxMembers}
                  onChange={(e) => setRoomData({ ...roomData, maxMembers: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={roomData.isPublic}
                  onChange={(e) => setRoomData({ ...roomData, isPublic: e.target.checked })}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="isPublic" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Make room public
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingRoom}
                  className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  {isCreatingRoom ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  <span>{isCreatingRoom ? 'Creating...' : 'Create Room'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <Code2 className="w-6 h-6 text-blue-500" />
              <span className="text-lg font-semibold">Code-Together</span>
            </div>
            
            <div className="flex items-center space-x-6">
              <a
                href="https://github.com/sahilatahar/Code-Sync"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
              >
                <Github className="w-5 h-5" />
                <span>GitHub</span>
              </a>
              <a
                href="#"
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
              >
                <Star className="w-5 h-5" />
                <span>Star us</span>
              </a>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; 2024 Code-Together. Built with ❤️ for collaborative coding.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
