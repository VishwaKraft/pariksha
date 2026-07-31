const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('./model/User');
const Test = require('./model/Test');
const Response = require('./model/Response');

class SocketServer {
  constructor(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.CLIENT_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
      }
    });

    this.activeStreams = new Map(); // userId -> stream data
    this.adminConnections = new Set(); // admin socket IDs

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  setupMiddleware() {
    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          return next(new Error('Authentication error: No token provided'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const user = await User.findById(decoded.id).select('-password');
        
        if (!user) {
          return next(new Error('Authentication error: User not found'));
        }

        socket.userId = user._id.toString();
        socket.userRole = user.role;
        socket.userName = user.name;
        next();
      } catch (err) {
        next(new Error('Authentication error: Invalid token'));
      }
    });
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`User connected: ${socket.userId} (${socket.userRole})`);

      // Handle admin connections
      if (socket.userRole === 'admin') {
        this.adminConnections.add(socket.id);
        this.sendActiveStreamsToAdmin(socket);
      }

      // Handle student video streaming
      if (socket.userRole === 'student') {
        this.handleStudentConnection(socket);
      }

      // Handle disconnections
      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.userId}`);
        
        if (socket.userRole === 'admin') {
          this.adminConnections.delete(socket.id);
        } else if (socket.userRole === 'student') {
          this.handleStudentDisconnection(socket);
        }
      });

      // Handle video stream data
      socket.on('videoStream', (data) => {
        this.handleVideoStream(socket, data);
      });

      // Handle stream updates
      socket.on('streamUpdate', (data) => {
        this.handleStreamUpdate(socket, data);
      });

      // Handle admin requests
      socket.on('requestStreams', () => {
        if (socket.userRole === 'admin') {
          this.sendActiveStreamsToAdmin(socket);
        }
      });
    });
  }

  handleStudentConnection(socket) {
    // Get current test information
    this.getCurrentTestInfo(socket.userId).then(testInfo => {
      const streamData = {
        userId: socket.userId,
        userName: socket.userName,
        testId: testInfo.testId,
        testName: testInfo.testName,
        status: 'connected',
        lastSeen: Date.now(),
        socketId: socket.id
      };

      this.activeStreams.set(socket.userId, streamData);
      this.broadcastToAdmins('videoStream', streamData);
    });
  }

  handleStudentDisconnection(socket) {
    if (this.activeStreams.has(socket.userId)) {
      const streamData = this.activeStreams.get(socket.userId);
      streamData.status = 'disconnected';
      streamData.lastSeen = Date.now();
      
      this.broadcastToAdmins('streamDisconnected', streamData);
      
      // Remove from active streams after 30 seconds
      setTimeout(() => {
        if (this.activeStreams.has(socket.userId)) {
          this.activeStreams.delete(socket.userId);
        }
      }, 30000);
    }
  }

  handleVideoStream(socket, data) {
    if (socket.userRole !== 'student') return;

    const streamData = this.activeStreams.get(socket.userId);
    if (streamData) {
      streamData.lastSeen = Date.now();
      streamData.status = 'active';
      
      // Broadcast video data to all admins
      this.broadcastToAdmins('videoData', {
        userId: socket.userId,
        chunk: data.chunk,
        timestamp: Date.now()
      });
    }
  }

  handleStreamUpdate(socket, data) {
    if (socket.userRole !== 'student') return;

    const streamData = this.activeStreams.get(socket.userId);
    if (streamData) {
      Object.assign(streamData, data);
      streamData.lastSeen = Date.now();
      
      this.broadcastToAdmins('streamUpdate', streamData);
    }
  }

  async getCurrentTestInfo(userId) {
    try {
      // Find the most recent response for this user
      const response = await Response.findOne({ userId })
        .sort({ createdAt: -1 })
        .populate('testId', 'name');

      if (response && response.testId) {
        return {
          testId: response.testId._id.toString(),
          testName: response.testId.name
        };
      }

      return {
        testId: null,
        testName: 'Unknown Test'
      };
    } catch (error) {
      console.error('Error getting test info:', error);
      return {
        testId: null,
        testName: 'Unknown Test'
      };
    }
  }

  sendActiveStreamsToAdmin(adminSocket) {
    const streams = Array.from(this.activeStreams.values());
    adminSocket.emit('activeStreams', streams);
  }

  broadcastToAdmins(event, data) {
    this.adminConnections.forEach(adminSocketId => {
      const adminSocket = this.io.sockets.sockets.get(adminSocketId);
      if (adminSocket) {
        adminSocket.emit(event, data);
      }
    });
  }

  // Method to get active streams count
  getActiveStreamsCount() {
    return this.activeStreams.size;
  }

  // Method to get all active streams
  getAllActiveStreams() {
    return Array.from(this.activeStreams.values());
  }

  // Method to force disconnect a user
  forceDisconnectUser(userId) {
    const streamData = this.activeStreams.get(userId);
    if (streamData) {
      const socket = this.io.sockets.sockets.get(streamData.socketId);
      if (socket) {
        socket.disconnect(true);
      }
    }
  }
}

module.exports = SocketServer;
