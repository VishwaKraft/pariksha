const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('./model/User');
const Response = require('./model/Response');

class SocketServer {
  constructor(server) {
    this.io = new Server(server, {
      cors: {
        // Allow both port 3000 and 3001 for local dev
        origin: [
          process.env.CLIENT_URL || 'http://localhost:3001',
          'http://localhost:3000',
          'http://localhost:3001',
        ],
        methods: ['GET', 'POST'],
        credentials: true,
      },
      maxHttpBufferSize: 2e6, // 2MB — enough for a JPEG frame
    });

    this.activeStreams = new Map(); // userId -> stream data
    this.adminConnections = new Set(); // admin socket IDs

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  setupMiddleware() {
    this.io.use(async (socket, next) => {
      try {
        const token =
          socket.handshake.auth.token ||
          socket.handshake.headers.authorization?.replace('Bearer ', '');

        if (!token) {
          return next(new Error('Authentication error: No token provided'));
        }

        // Use TOKEN_SECRET — the same key used everywhere else in the app
        const decoded = jwt.verify(token, process.env.TOKEN_SECRET);

        // Admin token has { user: "admin" } (a literal string, not a DB id)
        if (decoded.user === 'admin') {
          socket.userId = 'admin';
          socket.userRole = 'admin';
          socket.userName = 'Admin';
          return next();
        }

        // Student token has { user: <mongoId> }
        if (decoded.user) {
          const user = await User.findById(decoded.user).select('-password');
          if (!user) {
            return next(new Error('Authentication error: User not found'));
          }
          socket.userId = user._id.toString();
          socket.userRole = 'student';
          socket.userName = user.name;
          return next();
        }

        return next(new Error('Authentication error: Invalid token payload'));
      } catch (err) {
        console.error('Socket auth error:', err.message);
        next(new Error('Authentication error: Invalid token'));
      }
    });
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`Socket connected: ${socket.userName} (${socket.userRole})`);

      if (socket.userRole === 'admin') {
        this.adminConnections.add(socket.id);
        // Send current active streams immediately on admin connect
        this.sendActiveStreamsToAdmin(socket);
      }

      if (socket.userRole === 'student') {
        this.handleStudentConnection(socket);
      }

      socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.userName}`);
        if (socket.userRole === 'admin') {
          this.adminConnections.delete(socket.id);
        } else if (socket.userRole === 'student') {
          this.handleStudentDisconnection(socket);
        }
      });

      // Canvas snapshot frame from student (base64 JPEG)
      socket.on('videoFrame', (data) => {
        this.handleVideoFrame(socket, data);
      });

      // Legacy: raw MediaRecorder chunk (kept for compatibility)
      socket.on('videoStream', (data) => {
        this.handleVideoStream(socket, data);
      });

      // Metadata updates from student (testId, stage, etc.)
      socket.on('streamUpdate', (data) => {
        this.handleStreamUpdate(socket, data);
      });

      // Admin explicitly requests current stream list
      socket.on('requestStreams', () => {
        if (socket.userRole === 'admin') {
          this.sendActiveStreamsToAdmin(socket);
        }
      });
    });
  }

  handleStudentConnection(socket) {
    this.getCurrentTestInfo(socket.userId).then((testInfo) => {
      const streamData = {
        userId: socket.userId,
        userName: socket.userName,
        testId: testInfo.testId,
        testName: testInfo.testName,
        status: 'connected',
        lastSeen: Date.now(),
        socketId: socket.id,
      };
      this.activeStreams.set(socket.userId, streamData);
      this.broadcastToAdmins('studentConnected', streamData);
    });
  }

  handleStudentDisconnection(socket) {
    if (this.activeStreams.has(socket.userId)) {
      const streamData = this.activeStreams.get(socket.userId);
      streamData.status = 'disconnected';
      streamData.lastSeen = Date.now();
      this.broadcastToAdmins('streamDisconnected', streamData);

      setTimeout(() => {
        this.activeStreams.delete(socket.userId);
      }, 30000);
    }
  }

  // Primary video handler: canvas snapshot frames (base64 JPEG)
  handleVideoFrame(socket, data) {
    if (socket.userRole !== 'student') return;
    const streamData = this.activeStreams.get(socket.userId);
    if (streamData) {
      streamData.lastSeen = Date.now();
      streamData.status = 'active';
      this.broadcastToAdmins('videoFrame', {
        userId: socket.userId,
        userName: socket.userName,
        frame: data.frame, // base64 data URI
        timestamp: Date.now(),
      });
    }
  }

  // Legacy: raw chunk relay
  handleVideoStream(socket, data) {
    if (socket.userRole !== 'student') return;
    const streamData = this.activeStreams.get(socket.userId);
    if (streamData) {
      streamData.lastSeen = Date.now();
      streamData.status = 'active';
      this.broadcastToAdmins('videoData', {
        userId: socket.userId,
        chunk: data.chunk,
        timestamp: Date.now(),
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
      const response = await Response.findOne({ userId })
        .sort({ createdAt: -1 })
        .populate('testId', 'title');

      if (response && response.testId) {
        return {
          testId: response.testId._id.toString(),
          testName: response.testId.title,
        };
      }
      return { testId: null, testName: 'Unknown Test' };
    } catch (error) {
      console.error('Error getting test info:', error);
      return { testId: null, testName: 'Unknown Test' };
    }
  }

  sendActiveStreamsToAdmin(adminSocket) {
    const streams = Array.from(this.activeStreams.values());
    adminSocket.emit('activeStreams', streams);
  }

  broadcastToAdmins(event, data) {
    this.adminConnections.forEach((adminSocketId) => {
      const adminSocket = this.io.sockets.sockets.get(adminSocketId);
      if (adminSocket) {
        adminSocket.emit(event, data);
      }
    });
  }

  getActiveStreamsCount() { return this.activeStreams.size; }
  getAllActiveStreams() { return Array.from(this.activeStreams.values()); }

  forceDisconnectUser(userId) {
    const streamData = this.activeStreams.get(userId);
    if (streamData) {
      const socket = this.io.sockets.sockets.get(streamData.socketId);
      if (socket) socket.disconnect(true);
    }
  }
}

module.exports = SocketServer;
