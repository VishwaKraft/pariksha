# Webcam Monitoring System

This document describes the webcam monitoring system implemented in the Pariksha application for real-time test supervision.

## Overview

The webcam monitoring system allows administrators to view live video feeds from test takers during examinations. This provides real-time supervision and helps detect potential cheating activities.

## Features

### For Test Takers (Students)
- **Automatic Camera Access**: Camera is automatically activated when starting a test
- **Real-time Streaming**: Video is streamed to the server in real-time
- **Privacy Indicators**: Visual indicators show when camera is active
- **Error Handling**: Graceful handling of camera permission denials

### For Administrators
- **Live Video Feeds**: View multiple test takers simultaneously
- **Real-time Statistics**: Monitor active streams, disconnected users, etc.
- **User Information**: See test taker names, test details, and connection status
- **Fullscreen View**: Click to view individual streams in fullscreen
- **Connection Management**: Automatic detection of disconnected users

## Technical Implementation

### Backend Components

#### WebSocket Server (`server/socketServer.js`)
- Handles real-time communication between clients and server
- Manages active video streams
- Authenticates users and manages connections
- Broadcasts video data to admin clients

#### Monitoring API (`server/controller/monitorController.js`)
- Provides statistics about active sessions
- Tracks suspicious activities
- Manages monitoring data

#### Routes (`server/routes/monitor.js`)
- REST API endpoints for monitoring data
- Admin-only access with authentication

### Frontend Components

#### WebSocket Service (`client/src/helper/WebSocketService.js`)
- Manages WebSocket connections
- Handles video streaming from client to server
- Provides connection state management

#### Admin Monitor (`client/src/components/admin/WebcamMonitor.js`)
- Real-time video feed display
- Statistics dashboard
- User management interface
- Fullscreen viewing capabilities

#### Student Components
- Updated `questions.js` and `instruction.js` for video streaming
- Automatic camera initialization
- Error handling and user feedback

## Setup Instructions

### 1. Install Dependencies

```bash
# Backend dependencies
cd server
npm install socket.io uuid

# Frontend dependencies
cd ../client
npm install socket.io-client
```

### 2. Environment Variables

Ensure your `.env` file includes:

```env
JWT_SECRET=your-jwt-secret
CLIENT_URL=http://localhost:3000
```

### 3. Start the Application

```bash
# Start backend server
cd server
npm run dev

# Start frontend client
cd ../client
npm start
```

## Usage

### For Administrators

1. **Access Monitoring**: Navigate to `/admin/webcam` in the admin panel
2. **View Streams**: All active test sessions will appear automatically
3. **Monitor Statistics**: View real-time statistics at the top
4. **Fullscreen View**: Click the fullscreen button on any video feed
5. **Refresh Data**: Use the refresh button to update the stream list

### For Students

1. **Camera Permission**: Grant camera access when prompted
2. **Test Taking**: Camera automatically starts when beginning a test
3. **Privacy**: Camera indicator shows when recording is active
4. **Error Handling**: Clear error messages if camera access is denied

## Security Features

### Authentication
- JWT-based authentication for all WebSocket connections
- Role-based access control (admin vs student)
- Token validation on every connection

### Privacy
- Video streams are only accessible to authenticated admins
- No video data is stored permanently
- Automatic cleanup of disconnected streams

### Monitoring
- Real-time connection status tracking
- Automatic detection of suspicious activities
- Tab switching detection and reporting

## API Endpoints

### Monitoring Statistics
```
GET /api/monitor/stats
```
Returns overall monitoring statistics including total users, tests, and active sessions.

### Active Sessions
```
GET /api/monitor/active-sessions
```
Returns list of currently active test sessions with user and test details.

### Suspicious Activities
```
GET /api/monitor/suspicious
```
Returns list of sessions with high tab-switching counts (potential cheating).

## WebSocket Events

### Client to Server
- `videoStream`: Send video data chunks
- `streamUpdate`: Send stream status updates
- `requestStreams`: Request current active streams (admin only)

### Server to Client
- `videoData`: Receive video data chunks
- `videoStream`: New stream connection notification
- `streamUpdate`: Stream status updates
- `streamDisconnected`: Stream disconnection notification
- `activeStreams`: List of all active streams

## Troubleshooting

### Common Issues

1. **Camera Not Working**
   - Check browser permissions
   - Ensure HTTPS connection (required for camera access)
   - Verify camera is not being used by another application

2. **WebSocket Connection Failed**
   - Check server is running
   - Verify CORS settings
   - Check authentication token validity

3. **No Video Feeds in Admin Panel**
   - Ensure students have started their tests
   - Check WebSocket connection status
   - Verify admin authentication

### Browser Compatibility

- **Chrome**: Full support
- **Firefox**: Full support
- **Safari**: Full support
- **Edge**: Full support

**Note**: Camera access requires HTTPS in production environments.

## Performance Considerations

### Video Quality
- Default resolution: 640x480
- Frame rate: 15 FPS
- Bitrate: 250 kbps
- Format: WebM with VP8 codec

### Network Usage
- Approximately 250 kbps per active stream
- Chunked transmission (1-second intervals)
- Automatic cleanup of disconnected streams

### Server Resources
- Memory usage scales with active connections
- CPU usage minimal for video forwarding
- Database queries optimized for monitoring data

## Future Enhancements

### Planned Features
- Video recording and storage
- AI-powered cheating detection
- Advanced analytics dashboard
- Mobile app support
- Multi-camera support

### Security Improvements
- End-to-end encryption
- Advanced authentication methods
- Audit logging
- Compliance features

## Support

For technical support or questions about the webcam monitoring system, please refer to the main project documentation or contact the development team.
