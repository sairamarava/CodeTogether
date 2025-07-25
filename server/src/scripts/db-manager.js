#!/usr/bin/env node

import { program } from 'commander';
import dotenv from 'dotenv';
import { dbConnection } from '../config/database.js';
import { seeder } from '../config/seeder.js';
import User from '../models/User.js';
import Room from '../models/Room.js';
import File from '../models/File.js';
import Message from '../models/Message.js';

dotenv.config();

program
  .name('db-manager')
  .description('Code-Together Database Management CLI')
  .version('1.0.0');

// Database connection status
program
  .command('status')
  .description('Check database connection status')
  .action(async () => {
    try {
      await dbConnection.connect();
      const health = await dbConnection.healthCheck();
      
      console.log('📊 Database Status:');
      console.log(`   Status: ${health.status}`);
      console.log(`   Connected: ${health.connected}`);
      console.log(`   Host: ${health.host}`);
      console.log(`   Port: ${health.port}`);
      console.log(`   Database: ${health.name}`);
      
      process.exit(0);
    } catch (error) {
      console.error('❌ Error checking status:', error.message);
      process.exit(1);
    }
  });

// Seed database
program
  .command('seed')
  .description('Seed database with sample data')
  .option('-c, --clear', 'Clear existing data before seeding')
  .action(async (options) => {
    try {
      await dbConnection.connect();
      
      if (options.clear) {
        console.log('🧹 Clearing existing data...');
        await seeder.clearDatabase();
      }
      
      await seeder.seedAll();
      process.exit(0);
    } catch (error) {
      console.error('❌ Error seeding database:', error.message);
      process.exit(1);
    }
  });

// Clear database
program
  .command('clear')
  .description('Clear all data from database')
  .option('-f, --force', 'Force clear without confirmation')
  .action(async (options) => {
    try {
      await dbConnection.connect();
      
      if (!options.force) {
        console.log('⚠️  This will delete ALL data from the database!');
        console.log('Use --force flag to confirm this action.');
        process.exit(1);
      }
      
      await seeder.clearDatabase();
      console.log('✅ Database cleared successfully');
      process.exit(0);
    } catch (error) {
      console.error('❌ Error clearing database:', error.message);
      process.exit(1);
    }
  });

// Database statistics
program
  .command('stats')
  .description('Show database statistics')
  .action(async () => {
    try {
      await dbConnection.connect();
      
      const [userCount, roomCount, fileCount, messageCount] = await Promise.all([
        User.countDocuments(),
        Room.countDocuments(),
        File.countDocuments(),
        Message.countDocuments()
      ]);
      
      console.log('📈 Database Statistics:');
      console.log(`   👥 Users: ${userCount}`);
      console.log(`   🏠 Rooms: ${roomCount}`);
      console.log(`   📁 Files: ${fileCount}`);
      console.log(`   💬 Messages: ${messageCount}`);
      console.log(`   📊 Total Documents: ${userCount + roomCount + fileCount + messageCount}`);
      
      process.exit(0);
    } catch (error) {
      console.error('❌ Error getting statistics:', error.message);
      process.exit(1);
    }
  });

// List users
program
  .command('users')
  .description('List all users')
  .option('-l, --limit <number>', 'Limit number of results', '10')
  .action(async (options) => {
    try {
      await dbConnection.connect();
      
      const users = await User.find()
        .select('username email isOnline lastSeen createdAt')
        .limit(parseInt(options.limit))
        .sort({ createdAt: -1 });
      
      console.log(`📋 Users (showing ${users.length}):`);
      users.forEach(user => {
        console.log(`   ${user.username} (${user.email}) - ${user.isOnline ? '🟢 Online' : '🔴 Offline'}`);
      });
      
      process.exit(0);
    } catch (error) {
      console.error('❌ Error listing users:', error.message);
      process.exit(1);
    }
  });

// List rooms
program
  .command('rooms')
  .description('List all rooms')
  .option('-l, --limit <number>', 'Limit number of results', '10')
  .action(async (options) => {
    try {
      await dbConnection.connect();
      
      const rooms = await Room.find()
        .populate('owner', 'username')
        .select('roomId name isPublic members createdAt')
        .limit(parseInt(options.limit))
        .sort({ createdAt: -1 });
      
      console.log(`📋 Rooms (showing ${rooms.length}):`);
      rooms.forEach(room => {
        console.log(`   ${room.name} (${room.roomId}) - ${room.isPublic ? '🌍 Public' : '🔒 Private'} - ${room.members.length} members`);
      });
      
      process.exit(0);
    } catch (error) {
      console.error('❌ Error listing rooms:', error.message);
      process.exit(1);
    }
  });

// Create admin user
program
  .command('create-admin')
  .description('Create an admin user')
  .requiredOption('-u, --username <username>', 'Admin username')
  .requiredOption('-e, --email <email>', 'Admin email')
  .requiredOption('-p, --password <password>', 'Admin password')
  .action(async (options) => {
    try {
      await dbConnection.connect();
      
      const bcrypt = await import('bcryptjs');
      
      const existingUser = await User.findOne({
        $or: [{ email: options.email }, { username: options.username }]
      });
      
      if (existingUser) {
        console.log('❌ User with this email or username already exists');
        process.exit(1);
      }
      
      const hashedPassword = await bcrypt.hash(options.password, 12);
      
      const adminUser = new User({
        username: options.username,
        email: options.email,
        password: hashedPassword,
        preferences: {
          theme: 'dark',
          fontSize: 14,
          fontFamily: 'Monaco'
        }
      });
      
      await adminUser.save();
      
      console.log('✅ Admin user created successfully');
      console.log(`   Username: ${adminUser.username}`);
      console.log(`   Email: ${adminUser.email}`);
      console.log(`   ID: ${adminUser._id}`);
      
      process.exit(0);
    } catch (error) {
      console.error('❌ Error creating admin user:', error.message);
      process.exit(1);
    }
  });

// Backup database
program
  .command('backup')
  .description('Create database backup')
  .option('-o, --output <path>', 'Output directory', './backups')
  .action(async (options) => {
    try {
      await dbConnection.connect();
      
      const fs = await import('fs');
      const path = await import('path');
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupDir = path.join(options.output, `backup-${timestamp}`);
      
      if (!fs.existsSync(options.output)) {
        fs.mkdirSync(options.output, { recursive: true });
      }
      
      fs.mkdirSync(backupDir);
      
      console.log('📦 Creating database backup...');
      
      const [users, rooms, files, messages] = await Promise.all([
        User.find().lean(),
        Room.find().lean(),
        File.find().lean(),
        Message.find().lean()
      ]);
      
      const backupData = {
        timestamp: new Date().toISOString(),
        collections: {
          users,
          rooms,
          files,
          messages
        },
        metadata: {
          userCount: users.length,
          roomCount: rooms.length,
          fileCount: files.length,
          messageCount: messages.length
        }
      };
      
      fs.writeFileSync(
        path.join(backupDir, 'backup.json'),
        JSON.stringify(backupData, null, 2)
      );
      
      console.log(`✅ Backup created successfully at: ${backupDir}`);
      console.log(`📊 Backed up ${Object.values(backupData.metadata).reduce((a, b) => a + b, 0)} documents`);
      
      process.exit(0);
    } catch (error) {
      console.error('❌ Error creating backup:', error.message);
      process.exit(1);
    }
  });

// Handle unhandled promises
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

program.parse();
