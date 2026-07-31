import React, { useState, useEffect, useRef } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress
} from '@material-ui/core';
import {
  VideocamOff,
  Person,
  Refresh,
  Fullscreen,
  FullscreenExit
} from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import io from 'socket.io-client';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
  },
  monitorGrid: {
    marginTop: theme.spacing(2),
  },
  videoCard: {
    position: 'relative',
    marginBottom: theme.spacing(2),
    minHeight: '250px',
  },
  videoContainer: {
    position: 'relative',
    width: '100%',
    height: '200px',
    backgroundColor: '#000',
    borderRadius: theme.shape.borderRadius,
    overflow: 'hidden',
  },
  video: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: 'white',
  },
  userInfo: {
    position: 'absolute',
    top: theme.spacing(1),
    left: theme.spacing(1),
    zIndex: 1,
  },
  statusChip: {
    position: 'absolute',
    top: theme.spacing(1),
    right: theme.spacing(1),
    zIndex: 1,
  },
  controls: {
    position: 'absolute',
    bottom: theme.spacing(1),
    right: theme.spacing(1),
    zIndex: 1,
  },
  statsCard: {
    marginBottom: theme.spacing(2),
  },
  noStreams: {
    textAlign: 'center',
    padding: theme.spacing(4),
    color: theme.palette.text.secondary,
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '200px',
  },
}));

const WebcamMonitor = () => {
  const classes = useStyles();
  const [activeStreams, setActiveStreams] = useState({});
  const [stats, setStats] = useState({
    totalStreams: 0,
    activeStreams: 0,
    disconnectedStreams: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fullscreenStream, setFullscreenStream] = useState(null);
  const socketRef = useRef(null);
  const videoRefs = useRef({});

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
      transports: ['websocket'],
    });

    socketRef.current.on('connect', () => {
      console.log('Connected to monitoring server');
      setLoading(false);
      setError(null);
    });

    socketRef.current.on('connect_error', (err) => {
      console.error('Connection error:', err);
      setError('Failed to connect to monitoring server');
      setLoading(false);
    });

    // Listen for active streams list
    socketRef.current.on('activeStreams', (streams) => {
      console.log('Received active streams:', streams);
      const streamsMap = {};
      streams.forEach(stream => {
        streamsMap[stream.userId] = {
          ...stream,
          lastSeen: Date.now(),
        };
      });
      setActiveStreams(streamsMap);
    });

    // Listen for new video streams
    socketRef.current.on('videoStream', (data) => {
      console.log('Received video stream:', data);
      setActiveStreams(prev => ({
        ...prev,
        [data.userId]: {
          ...prev[data.userId],
          ...data,
          lastSeen: Date.now(),
          status: 'active',
        },
      }));
    });

    // Listen for stream updates
    socketRef.current.on('streamUpdate', (data) => {
      setActiveStreams(prev => ({
        ...prev,
        [data.userId]: {
          ...prev[data.userId],
          ...data,
          lastSeen: Date.now(),
        },
      }));
    });

    // Listen for stream disconnections
    socketRef.current.on('streamDisconnected', (data) => {
      setActiveStreams(prev => ({
        ...prev,
        [data.userId]: {
          ...prev[data.userId],
          status: 'disconnected',
          lastSeen: Date.now(),
        },
      }));
    });

    // Listen for video data
    socketRef.current.on('videoData', (data) => {
      const videoElement = videoRefs.current[data.userId];
      if (videoElement && data.chunk) {
        const reader = new FileReader();
        reader.onload = () => {
          videoElement.src = reader.result;
        };
        reader.readAsDataURL(data.chunk);
      }
    });

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Update stats when streams change
  useEffect(() => {
    const streamList = Object.values(activeStreams);
    setStats({
      totalStreams: streamList.length,
      activeStreams: streamList.filter(s => s.status === 'active').length,
      disconnectedStreams: streamList.filter(s => s.status === 'disconnected').length,
    });
  }, [activeStreams]);

  // Check for stale streams
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setActiveStreams(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(userId => {
          if (now - updated[userId].lastSeen > 30000) { // 30 seconds timeout
            updated[userId] = {
              ...updated[userId],
              status: 'disconnected',
            };
          }
        });
        return updated;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    if (socketRef.current) {
      socketRef.current.emit('requestStreams');
    }
  };

  const handleFullscreen = (userId) => {
    if (fullscreenStream === userId) {
      setFullscreenStream(null);
    } else {
      setFullscreenStream(userId);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'disconnected':
        return 'error';
      default:
        return 'default';
    }
  };

  const renderVideoCard = (userId, streamData) => {
    const isFullscreen = fullscreenStream === userId;
    
    return (
      <Grid item xs={12} sm={6} md={4} lg={3} key={userId}>
        <Card className={classes.videoCard}>
          <div className={classes.videoContainer}>
            <video
              ref={el => videoRefs.current[userId] = el}
              className={classes.video}
              autoPlay
              muted
              playsInline
            />
            {streamData.status !== 'active' && (
              <div className={classes.videoOverlay}>
                <Box textAlign="center">
                  <VideocamOff fontSize="large" />
                  <Typography variant="body2">
                    {streamData.status === 'disconnected' ? 'Disconnected' : 'No Stream'}
                  </Typography>
                </Box>
              </div>
            )}
            
            {/* User Info Overlay */}
            <div className={classes.userInfo}>
              <Chip
                icon={<Person />}
                label={streamData.userName || `User ${userId.slice(0, 8)}`}
                size="small"
                color="primary"
                variant="outlined"
              />
            </div>

            {/* Status Chip */}
            <div className={classes.statusChip}>
              <Chip
                label={streamData.status}
                size="small"
                color={getStatusColor(streamData.status)}
                variant="filled"
              />
            </div>

            {/* Controls */}
            <div className={classes.controls}>
              <Tooltip title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}>
                <IconButton
                  size="small"
                  onClick={() => handleFullscreen(userId)}
                  style={{ color: 'white' }}
                >
                  {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
                </IconButton>
              </Tooltip>
            </div>
          </div>
          
          <CardContent>
            <Typography variant="body2" color="textSecondary">
              Test: {streamData.testName || 'Unknown'}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Last seen: {new Date(streamData.lastSeen).toLocaleTimeString()}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    );
  };

  if (loading) {
    return (
      <div className={classes.loadingContainer}>
        <CircularProgress />
        <Typography variant="body1" style={{ marginLeft: 16 }}>
          Connecting to monitoring server...
        </Typography>
      </div>
    );
  }

  if (error) {
    return (
      <Box className={classes.root}>
        <Paper 
          style={{ 
            padding: 16, 
            backgroundColor: '#ffebee', 
            border: '1px solid #f44336',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Typography variant="body1" style={{ color: '#d32f2f' }}>
            {error}
          </Typography>
          <IconButton onClick={handleRefresh} color="inherit">
            <Refresh />
          </IconButton>
        </Paper>
      </Box>
    );
  }

  const streamList = Object.entries(activeStreams);

  return (
    <div className={classes.root}>
      <Typography variant="h4" gutterBottom>
        Live Webcam Monitoring
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={2} className={classes.statsCard}>
        <Grid item xs={12} sm={4}>
          <Paper className={classes.statsCard} style={{ padding: 16, textAlign: 'center' }}>
            <Typography variant="h6" color="primary">
              {stats.totalStreams}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Total Streams
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper className={classes.statsCard} style={{ padding: 16, textAlign: 'center' }}>
            <Typography variant="h6" color="success.main">
              {stats.activeStreams}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Active Streams
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper className={classes.statsCard} style={{ padding: 16, textAlign: 'center' }}>
            <Typography variant="h6" color="error.main">
              {stats.disconnectedStreams}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Disconnected
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Controls */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">
          Active Test Sessions ({streamList.length})
        </Typography>
        <IconButton onClick={handleRefresh} color="primary">
          <Refresh />
        </IconButton>
      </Box>

      {/* Video Grid */}
      {streamList.length === 0 ? (
        <Paper className={classes.noStreams}>
          <VideocamOff fontSize="large" />
          <Typography variant="h6" gutterBottom>
            No Active Streams
          </Typography>
          <Typography variant="body2">
            Test takers will appear here when they start their exams.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={2} className={classes.monitorGrid}>
          {streamList.map(([userId, streamData]) => 
            renderVideoCard(userId, streamData)
          )}
        </Grid>
      )}

      {/* Fullscreen Modal */}
      {fullscreenStream && activeStreams[fullscreenStream] && (
        <Box
          position="fixed"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bgcolor="black"
          zIndex={9999}
          display="flex"
          alignItems="center"
          justifyContent="center"
          onClick={() => setFullscreenStream(null)}
        >
          <Box position="relative" width="90%" height="90%">
            <video
              ref={el => videoRefs.current[fullscreenStream] = el}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
              }}
              autoPlay
              muted
              playsInline
            />
            <IconButton
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                color: 'white',
                backgroundColor: 'rgba(0,0,0,0.5)',
              }}
              onClick={() => setFullscreenStream(null)}
            >
              <FullscreenExit />
            </IconButton>
          </Box>
        </Box>
      )}
    </div>
  );
};

export default WebcamMonitor;
