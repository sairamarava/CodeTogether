import User from '../models/User.js';
import Room from '../models/Room.js';
import File from '../models/File.js';
import Message from '../models/Message.js';
import bcrypt from 'bcryptjs';
import { generateRoomId } from '../utils/helpers.js';

class DatabaseSeeder {
  async clearDatabase() {
    try {
      console.log('🧹 Clearing database...');
      await User.deleteMany({});
      await Room.deleteMany({});
      await File.deleteMany({});
      await Message.deleteMany({});
      console.log('✅ Database cleared');
    } catch (error) {
      console.error('❌ Error clearing database:', error);
    }
  }

  async seedUsers() {
    try {
      console.log('👥 Seeding users...');
      
      const users = [
        {
          username: 'admin',
          email: 'admin@codetogether.com',
          password: await bcrypt.hash('admin123', 12),
          preferences: {
            theme: 'dark',
            fontSize: 14,
            fontFamily: 'Monaco'
          }
        },
        {
          username: 'developer',
          email: 'dev@codetogether.com',
          password: await bcrypt.hash('dev123', 12),
          preferences: {
            theme: 'light',
            fontSize: 16,
            fontFamily: 'Consolas'
          }
        },
        {
          username: 'tester',
          email: 'test@codetogether.com',
          password: await bcrypt.hash('test123', 12),
          preferences: {
            theme: 'dark',
            fontSize: 12,
            fontFamily: 'Ubuntu Mono'
          }
        }
      ];

      const createdUsers = await User.insertMany(users);
      console.log(`✅ Created ${createdUsers.length} users`);
      return createdUsers;
      
    } catch (error) {
      console.error('❌ Error seeding users:', error);
      return [];
    }
  }

  async seedRooms(users) {
    try {
      console.log('🏠 Seeding rooms...');
      
      const rooms = [
        {
          roomId: generateRoomId(),
          name: 'Welcome Room',
          description: 'A public room to get started with Code-Together',
          owner: users[0]._id,
          members: [
            { user: users[0]._id, role: 'owner' },
            { user: users[1]._id, role: 'editor' }
          ],
          isPublic: true,
          maxMembers: 20,
          settings: {
            allowFileUpload: true,
            allowCodeExecution: true,
            allowChat: true,
            allowDrawing: true
          }
        },
        {
          roomId: generateRoomId(),
          name: 'JavaScript Workshop',
          description: 'Learn JavaScript together',
          owner: users[1]._id,
          members: [
            { user: users[1]._id, role: 'owner' },
            { user: users[2]._id, role: 'editor' }
          ],
          isPublic: true,
          maxMembers: 15
        },
        {
          roomId: generateRoomId(),
          name: 'Private Project',
          description: 'Private development space',
          owner: users[0]._id,
          members: [
            { user: users[0]._id, role: 'owner' }
          ],
          isPublic: false,
          maxMembers: 5
        }
      ];

      const createdRooms = await Room.insertMany(rooms);
      console.log(`✅ Created ${createdRooms.length} rooms`);
      return createdRooms;
      
    } catch (error) {
      console.error('❌ Error seeding rooms:', error);
      return [];
    }
  }

  async seedFiles(rooms, users) {
    try {
      console.log('📁 Seeding files...');
      
      const files = [];
      
      // Welcome Room files
      files.push(
        {
          name: 'welcome.js',
          path: 'welcome.js',
          content: `// Welcome to Code-Together! 🚀
// This is a collaborative code editor where you can:
// - Code together in real-time
// - Chat with your team
// - Execute code in multiple languages
// - Share files and folders

console.log("Welcome to Code-Together!");
console.log("Start coding collaboratively!");

// Try editing this file - others will see your changes in real-time!
const greeting = "Hello, World!";
console.log(greeting);`,
          language: 'javascript',
          roomId: rooms[0].roomId,
          createdBy: users[0]._id,
          lastModifiedBy: users[0]._id,
          size: 400
        },
        {
          name: 'README.md',
          path: 'README.md',
          content: `# Welcome to Code-Together 🎉

## Getting Started

1. **Real-time Editing**: Start typing and see changes appear instantly
2. **File Management**: Use the file tree to create, rename, and delete files
3. **Code Execution**: Click the play button to run your code
4. **Chat**: Use the chat panel to communicate with your team
5. **Collaboration**: Invite others using the room ID

## Supported Languages

- JavaScript
- Python
- Java
- C++
- C#
- Go
- Rust
- And many more!

Happy coding! 🚀`,
          language: 'markdown',
          roomId: rooms[0].roomId,
          createdBy: users[0]._id,
          lastModifiedBy: users[0]._id,
          size: 200
        }
      );

      // JavaScript Workshop files
      files.push(
        {
          name: 'basics.js',
          path: 'lessons/basics.js',
          content: `// JavaScript Basics Workshop
// Learn the fundamentals of JavaScript

// Variables
let name = "Code-Together";
const version = "1.0.0";
var isLearning = true;

// Functions
function greetUser(username) {
    return \`Hello, \${username}! Welcome to the workshop.\`;
}

// Arrays
const topics = [
    "Variables",
    "Functions", 
    "Arrays",
    "Objects",
    "Async/Await"
];

// Objects
const workshop = {
    title: "JavaScript Fundamentals",
    duration: "2 hours",
    instructor: "Code-Together Team",
    students: []
};

console.log(greetUser("Student"));
console.log("Topics covered:", topics);`,
          language: 'javascript',
          roomId: rooms[1].roomId,
          createdBy: users[1]._id,
          lastModifiedBy: users[1]._id,
          size: 500
        },
        {
          name: 'exercises.js',
          path: 'exercises/exercises.js',
          content: `// JavaScript Exercises
// Complete the following exercises

// Exercise 1: Array Manipulation
function findLargestNumber(numbers) {
    // TODO: Return the largest number in the array
    return Math.max(...numbers);
}

// Exercise 2: String Manipulation
function reverseString(str) {
    // TODO: Return the reversed string
    return str.split('').reverse().join('');
}

// Exercise 3: Object Methods
class Calculator {
    add(a, b) {
        // TODO: Implement addition
        return a + b;
    }
    
    multiply(a, b) {
        // TODO: Implement multiplication
        return a * b;
    }
}

// Test your solutions
console.log(findLargestNumber([1, 5, 3, 9, 2])); // Should output: 9
console.log(reverseString("hello")); // Should output: "olleh"

const calc = new Calculator();
console.log(calc.add(5, 3)); // Should output: 8
console.log(calc.multiply(4, 6)); // Should output: 24`,
          language: 'javascript',
          roomId: rooms[1].roomId,
          createdBy: users[1]._id,
          lastModifiedBy: users[1]._id,
          size: 600
        }
      );

      const createdFiles = await File.insertMany(files);
      console.log(`✅ Created ${createdFiles.length} files`);
      return createdFiles;
      
    } catch (error) {
      console.error('❌ Error seeding files:', error);
      return [];
    }
  }

  async seedMessages(rooms, users) {
    try {
      console.log('💬 Seeding messages...');
      
      const messages = [
        {
          roomId: rooms[0].roomId,
          sender: users[0]._id,
          content: 'Welcome everyone to Code-Together! 🎉',
          type: 'text'
        },
        {
          roomId: rooms[0].roomId,
          sender: users[1]._id,
          content: 'Thanks for setting this up! Excited to collaborate.',
          type: 'text'
        },
        {
          roomId: rooms[1].roomId,
          sender: users[1]._id,
          content: 'Welcome to the JavaScript workshop! Let\'s start with the basics.',
          type: 'text'
        },
        {
          roomId: rooms[1].roomId,
          sender: users[2]._id,
          content: 'Looking forward to learning! 📚',
          type: 'text'
        }
      ];

      const createdMessages = await Message.insertMany(messages);
      console.log(`✅ Created ${createdMessages.length} messages`);
      return createdMessages;
      
    } catch (error) {
      console.error('❌ Error seeding messages:', error);
      return [];
    }
  }

  async seedAll() {
    try {
      console.log('🌱 Starting database seeding...');
      
      // Clear existing data
      await this.clearDatabase();
      
      // Seed data in order
      const users = await this.seedUsers();
      const rooms = await this.seedRooms(users);
      const files = await this.seedFiles(rooms, users);
      const messages = await this.seedMessages(rooms, users);
      
      console.log('🎉 Database seeding completed successfully!');
      console.log('📊 Summary:');
      console.log(`   👥 Users: ${users.length}`);
      console.log(`   🏠 Rooms: ${rooms.length}`);
      console.log(`   📁 Files: ${files.length}`);
      console.log(`   💬 Messages: ${messages.length}`);
      
      return {
        users,
        rooms,
        files,
        messages
      };
      
    } catch (error) {
      console.error('❌ Error during seeding:', error);
      throw error;
    }
  }
}

export const seeder = new DatabaseSeeder();
export default seeder;
