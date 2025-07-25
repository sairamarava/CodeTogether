# MongoDB Setup Guide for Code-Together

## Option 1: Local MongoDB Installation (Recommended for Development)

### Windows Installation

1. **Download MongoDB Community Server:**
   - Go to: https://www.mongodb.com/try/download/community
   - Select Version: 7.0.x (Current)
   - Platform: Windows
   - Package: MSI

2. **Install MongoDB:**
   ```bash
   # Run the downloaded .msi file
   # Choose "Complete" installation
   # Install "MongoDB Compass" (GUI tool)
   # Install as Windows Service
   ```

3. **Verify Installation:**
   ```bash
   # Open Command Prompt and run:
   mongod --version
   mongo --version
   ```

4. **Start MongoDB Service:**
   ```bash
   # MongoDB should start automatically as a Windows service
   # To manually start:
   net start MongoDB
   
   # To stop:
   net stop MongoDB
   ```

5. **Create Database Directory (if needed):**
   ```bash
   # Default path: C:\data\db
   # Create if doesn't exist:
   mkdir C:\data\db
   ```

### macOS Installation

1. **Using Homebrew:**
   ```bash
   # Install Homebrew (if not installed)
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   
   # Add MongoDB tap
   brew tap mongodb/brew
   
   # Install MongoDB
   brew install mongodb-community@7.0
   ```

2. **Start MongoDB:**
   ```bash
   # Start as a service
   brew services start mongodb/brew/mongodb-community
   
   # Or run manually
   mongod --config /usr/local/etc/mongod.conf
   ```

### Linux (Ubuntu/Debian) Installation

1. **Import MongoDB GPG Key:**
   ```bash
   curl -fsSL https://pgp.mongodb.com/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
   ```

2. **Add MongoDB Repository:**
   ```bash
   echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
   ```

3. **Install MongoDB:**
   ```bash
   sudo apt-get update
   sudo apt-get install -y mongodb-org
   ```

4. **Start MongoDB:**
   ```bash
   sudo systemctl start mongod
   sudo systemctl enable mongod
   ```

## Option 2: MongoDB Atlas (Cloud Database)

### Setup MongoDB Atlas

1. **Create Account:**
   - Go to: https://www.mongodb.com/cloud/atlas
   - Sign up for free account

2. **Create Cluster:**
   - Choose "Build a Database" → "Free" (M0 Sandbox)
   - Select cloud provider and region
   - Name your cluster

3. **Database Access:**
   - Go to "Database Access"
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Create username and password
   - Grant "Read and write to any database" role

4. **Network Access:**
   - Go to "Network Access"
   - Click "Add IP Address"
   - Choose "Allow Access from Anywhere" (0.0.0.0/0) for development
   - Or add your specific IP address

5. **Get Connection String:**
   - Go to "Database" → "Connect"
   - Choose "Connect your application"
   - Copy the connection string

### Update Environment Variables

Update your `server/.env` file:

```env
# For Local MongoDB
MONGODB_URI=mongodb://localhost:27017/codetogether

# For MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/codetogether?retryWrites=true&w=majority
```

## Option 3: Docker MongoDB (Alternative)

### Using Docker Compose

1. **Create docker-compose.yml:**
   ```yaml
   version: '3.8'
   services:
     mongodb:
       image: mongo:7.0
       container_name: codetogether-mongo
       restart: always
       ports:
         - "27017:27017"
       environment:
         MONGO_INITDB_ROOT_USERNAME: admin
         MONGO_INITDB_ROOT_PASSWORD: password123
         MONGO_INITDB_DATABASE: codetogether
       volumes:
         - mongodb_data:/data/db
   
   volumes:
     mongodb_data:
   ```

2. **Start MongoDB:**
   ```bash
   docker-compose up -d
   ```

3. **Update Environment:**
   ```env
   MONGODB_URI=mongodb://admin:password123@localhost:27017/codetogether?authSource=admin
   ```

## Database Setup Commands

After MongoDB is running, set up your database:

```bash
# Navigate to server directory
cd server

# Install dependencies (if commander is missing)
npm install

# Check database connection
npm run db:status

# Seed database with sample data
npm run db:seed

# View database statistics
npm run db:stats

# List users and rooms
npm run db:users
npm run db:rooms

# Create admin user
npm run db:create-admin -u admin -e admin@example.com -p admin123
```

## Verification Steps

1. **Test Database Connection:**
   ```bash
   npm run db:status
   ```

2. **Check Health Endpoint:**
   ```bash
   curl http://localhost:3000/health
   ```

3. **Seed Sample Data:**
   ```bash
   npm run db:seed
   ```

4. **Start the Application:**
   ```bash
   npm run dev
   ```

## Troubleshooting

### Common Issues

1. **Connection Refused:**
   - Ensure MongoDB service is running
   - Check if port 27017 is available
   - Verify MONGODB_URI in .env file

2. **Authentication Failed:**
   - Check username/password in connection string
   - Verify database user permissions

3. **Network Timeout:**
   - Check firewall settings
   - Verify MongoDB Atlas IP whitelist
   - Ensure network connectivity

### Useful Commands

```bash
# Check MongoDB service status (Windows)
sc query MongoDB

# Check MongoDB service status (Linux/macOS)
sudo systemctl status mongod

# Connect to MongoDB shell
mongosh

# View database logs
tail -f /var/log/mongodb/mongod.log
```

## Next Steps

Once MongoDB is set up:

1. ✅ MongoDB installed and running
2. ✅ Database connection verified
3. ✅ Sample data seeded
4. ✅ Application running successfully

Your Code-Together application is now ready with full database functionality! 🚀
