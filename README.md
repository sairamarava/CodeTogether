# Code-Together 🚀

A real-time collaborative code editor that enables multiple users to code together simultaneously. Built with modern web technologies for a seamless coding experience.

## 🌟 Features

### Core Features

- **Real-time Collaboration**: Multiple users can edit code simultaneously with live cursors
- **File Management**: Create, edit, delete files and folders with a visual file tree
- **Code Execution**: Run code in 14+ programming languages using Piston API
- **Syntax Highlighting**: Monaco Editor with VS Code-like experience
- **Live Chat**: Real-time messaging within coding rooms
- **User Management**: See who's online and track their activity

### Advanced Features

- **Auto-save**: Automatic file saving every 2 seconds
- **Multiple Themes**: Dark/Light mode support
- **Room Sharing**: Easy room sharing with links and room IDs
- **Responsive Design**: Works on desktop and tablet devices
- **Error Handling**: Comprehensive error handling and user feedback

## 🛠️ Tech Stack

### Frontend

- **React 18** + **Vite** - Modern React development
- **Monaco Editor** - VS Code editor engine
- **Socket.io Client** - Real-time communication
- **Tailwind CSS** - Utility-first CSS framework
- **Zustand** - Lightweight state management
- **React Router** - Client-side routing
- **Heroicons** - Beautiful SVG icons

### Backend

- **Node.js** + **Express.js** - Server framework
- **Socket.io** - Real-time bidirectional communication
- **MongoDB** + **Mongoose** - Database and ODM
- **JWT** - Authentication and authorization
- **bcryptjs** - Password hashing
- **Piston API** - Code execution engine

### Development Tools

- **Vite** - Fast development and build tool
- **Nodemon** - Auto-restart development server
- **Concurrently** - Run multiple commands
- **ESLint** + **Prettier** - Code linting and formatting

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** and **npm**
- **MongoDB** running locally or MongoDB Atlas account
- **Git** for version control

### Installation

1. **Clone the repository:**

```bash
git clone https://github.com/your-username/code-together.git
cd code-together
```

2. **Install all dependencies:**

```bash
npm run install-all
```

3. **Start MongoDB:**

   - **Local MongoDB:** Make sure MongoDB is running on `localhost:27017`
   - **MongoDB Atlas:** Update the connection string in `.env` files

4. **Start the application:**

   - **Windows:** Double-click `start.bat` or run:
     ```bash
     npm run dev
     ```
   - **Manual:** Open two terminals:

     ```bash
     # Terminal 1: Backend
     cd server && npm run dev

     # Terminal 2: Frontend
     cd client && npm run dev
     ```

5. **Open your browser:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

## 📁 Project Structure

```
code-together/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/        # Main application pages
│   │   ├── stores/       # Zustand state management
│   │   ├── utils/        # Utility functions
│   │   └── App.jsx       # Main App component
│   ├── package.json
│   └── vite.config.js
├── server/                # Express backend
│   ├── src/
│   │   ├── models/       # MongoDB models
│   │   ├── routes/       # API routes
│   │   ├── socket/       # Socket.io handlers
│   │   ├── middleware/   # Express middleware
│   │   ├── utils/        # Utility functions
│   │   └── index.js      # Server entry point
│   └── package.json
├── README.md
├── package.json          # Root package.json
└── start.bat            # Windows startup script
```

## 🎯 Usage Guide

### Creating a Room

1. Visit the homepage
2. Click "Create New Room"
3. Enter a room name
4. Start coding!

### Joining a Room

1. Get a room link or room ID from someone
2. Click "Join Room" and enter the room ID
3. Start collaborating!

### File Operations

- **Create:** Right-click in file tree → New File/Folder
- **Rename:** Right-click file → Rename
- **Delete:** Right-click file → Delete
- **Select:** Click on any file to open it

### Code Execution

1. Open the execution panel (Play button in top bar)
2. Select your programming language
3. Add any input if needed
4. Click "Run Code"

### Real-time Features

- **Live Cursors:** See where other users are typing
- **Live Chat:** Use the chat panel to communicate
- **Auto-sync:** All changes are automatically synced

## 🔧 Configuration

### Environment Variables

**Server (.env):**

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/codetogether
JWT_SECRET=your-super-secret-jwt-key
CORS_ORIGIN=http://localhost:5173
PISTON_API_URL=https://emkc.org/api/v2/piston
```

**Client (.env):**

```env
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
```

### Supported Languages

JavaScript, TypeScript, Python, Java, C++, C, C#, PHP, Ruby, Go, Rust, Swift, Kotlin, Scala

## 🧪 Development

### Available Scripts

**Root:**

- `npm run dev` - Start both client and server
- `npm run build` - Build client for production
- `npm run install-all` - Install all dependencies

**Server:**

- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server

**Client:**

- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Code Quality

- ESLint configuration for both client and server
- Prettier for code formatting
- Husky for git hooks (optional)

## 🚧 Known Issues & Limitations

1. **File Upload:** Currently supports text files only
2. **Mobile Support:** Optimized for desktop/tablet use
3. **Language Support:** Limited to Piston API supported languages
4. **Room Persistence:** Rooms are session-based (consider Redis for production)

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcryptjs
- CORS protection
- Rate limiting
- Input validation and sanitization
- Environment variable protection

## 📈 Performance Optimizations

- Debounced real-time updates
- Efficient Monaco Editor configuration
- Zustand for lightweight state management
- Vite for fast development and builds
- Compression middleware
- Connection pooling for MongoDB

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Monaco Editor](https://microsoft.github.io/monaco-editor/) for the amazing code editor
- [Piston API](https://piston.readthedocs.io/) for code execution
- [Socket.io](https://socket.io/) for real-time communication
- [Tailwind CSS](https://tailwindcss.com/) for the beautiful styling

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-username/code-together/issues) page
2. Create a new issue with detailed information
3. Join our community discussions

---

**Happy Collaborative Coding! 🎉**
npm install

````

3. Install client dependencies:
```bash
cd ../client
npm install
````

4. Set up environment variables:

**Server (.env):**

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/codetogether
JWT_SECRET=your-super-secret-jwt-key
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
```

**Client (.env):**

```env
VITE_BACKEND_URL=http://localhost:3000
VITE_SOCKET_URL=ws://localhost:3000
```

5. Start the development servers:

**Terminal 1 (Server):**

```bash
cd server
npm run dev
```

**Terminal 2 (Client):**

```bash
cd client
npm run dev
```

6. Open your browser and navigate to `http://localhost:5173`

## Usage 📚

1. **Create a Room**: Click "Create New Room" to start a collaborative session
2. **Share Room ID**: Share the room ID with collaborators
3. **Code Together**: Edit files in real-time with multiple users
4. **Execute Code**: Use the run button to execute code in various languages
5. **Chat**: Use the chat panel for communication
6. **Draw**: Switch to the drawing board for visual collaboration

## API Endpoints 🔌

- `POST /api/rooms` - Create new room
- `GET /api/rooms/:id` - Get room details
- `POST /api/auth/login` - User authentication
- `GET /api/files/:roomId` - Get room files
- `POST /api/execute` - Execute code

## Socket Events 📡

- `join-room` - Join a collaboration room
- `leave-room` - Leave a room
- `code-change` - Real-time code updates
- `cursor-position` - User cursor positions
- `user-typing` - Typing indicators
- `chat-message` - Real-time chat

## Contributing 🤝

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License 📄

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments 🙏

- Monaco Editor for the amazing code editing experience
- Socket.io for real-time communication
- Piston API for code execution capabilities
- Tailwind CSS for beautiful styling

---

Made with ❤️ for collaborative coding
#   C o d e T o g e t h e r 
 
 
