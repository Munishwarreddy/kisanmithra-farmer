# MongoDB Setup Guide

## Option 1: Install MongoDB Locally (Recommended for Development)

### Windows Installation

1. **Download MongoDB Community Server**
   - Visit: https://www.mongodb.com/try/download/community
   - Select: Windows, MSI package
   - Download and run the installer

2. **Installation Steps**
   - Choose "Complete" installation
   - Install MongoDB as a Service (recommended)
   - Install MongoDB Compass (GUI tool) - optional but helpful

3. **Start MongoDB Service**
   ```powershell
   # Start MongoDB service
   net start MongoDB
   
   # Check if MongoDB is running
   mongosh --eval "db.version()"
   ```

4. **Verify Connection**
   ```powershell
   # Connect to MongoDB
   mongosh
   
   # In MongoDB shell:
   show dbs
   ```

### macOS Installation

```bash
# Install using Homebrew
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community

# Verify connection
mongosh
```

### Linux Installation

```bash
# Ubuntu/Debian
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Verify connection
mongosh
```

## Option 2: Use MongoDB Atlas (Cloud Database)

1. **Create Free Account**
   - Visit: https://www.mongodb.com/cloud/atlas/register
   - Sign up for free tier (512MB storage)

2. **Create Cluster**
   - Choose free tier (M0)
   - Select region closest to you
   - Create cluster (takes 3-5 minutes)

3. **Configure Access**
   - Database Access: Create database user with password
   - Network Access: Add IP address (0.0.0.0/0 for development)

4. **Get Connection String**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy connection string
   - Replace `<password>` with your database user password

5. **Update .env File**
   ```env
   MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/kisanmithra?retryWrites=true&w=majority
   ```

## Option 3: Use Docker (Quick Setup)

```bash
# Pull MongoDB image
docker pull mongo

# Run MongoDB container
docker run -d -p 27017:27017 --name mongodb mongo

# Verify it's running
docker ps

# Stop MongoDB
docker stop mongodb

# Start MongoDB
docker start mongodb
```

## Troubleshooting

### MongoDB Not Starting

**Windows:**
```powershell
# Check service status
Get-Service MongoDB

# Restart service
net stop MongoDB
net start MongoDB
```

**macOS/Linux:**
```bash
# Check status
sudo systemctl status mongod

# Restart
sudo systemctl restart mongod

# Check logs
sudo tail -f /var/log/mongodb/mongod.log
```

### Connection Refused Error

1. **Check if MongoDB is running:**
   ```bash
   # Windows
   Get-Service MongoDB
   
   # macOS/Linux
   sudo systemctl status mongod
   ```

2. **Check port 27017 is not in use:**
   ```bash
   # Windows
   netstat -ano | findstr :27017
   
   # macOS/Linux
   lsof -i :27017
   ```

3. **Check MongoDB configuration:**
   - Location: `C:\Program Files\MongoDB\Server\{version}\bin\mongod.cfg` (Windows)
   - Ensure `bindIp: 127.0.0.1` or `bindIp: 0.0.0.0`

### Database Connection String Issues

- Ensure no spaces in connection string
- Check username/password are correct
- For Atlas: Ensure IP is whitelisted
- For local: Ensure MongoDB service is running

## Testing the Connection

Once MongoDB is running, test the connection:

```bash
# Navigate to API directory
cd api

# Start the server
npm start

# You should see:
# ✅ MongoDB connected successfully
# 🚀 KisanMithra API Server running on port 5000
```

## Next Steps

After MongoDB is running:

1. **Run the message API tests:**
   ```bash
   node test-messages.js
   ```

2. **Test endpoints manually using Postman or curl**

3. **Check MongoDB data:**
   ```bash
   mongosh
   use kisanmithra
   db.messages.find().pretty()
   ```
