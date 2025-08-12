# Code-Together 🚀

A real-time collaborative code editor that enables multiple users to code together simultaneously. Built with modern web technologies for a seamless coding experience.
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
## 🙏 Acknowledgments

- [Monaco Editor](https://microsoft.github.io/monaco-editor/) for the amazing code editor
- [Piston API](https://piston.readthedocs.io/) for code execution
- [Socket.io](https://socket.io/) for real-time communication
- [Tailwind CSS](https://tailwindcss.com/) for the beautiful styling


Made with ❤️ for collaborative coding
#

