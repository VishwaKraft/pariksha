import React, { useState, useEffect, useRef } from 'react';
import {
  Grid, Paper, Typography, Box, Card, CardContent,
  Chip, IconButton, Tooltip, CircularProgress
} from '@mui/material';
import { VideocamOff, Person, Refresh, Fullscreen, FullscreenExit } from '@mui/icons-material';
import { makeStyles } from '@mui/styles';
import io from 'socket.io-client';
import { isAuthenticatedAdmin } from '../../helper/Auth';

const useStyles = makeStyles((theme) => ({
  root: { padding: theme.spacing(2) },
  monitorGrid: { marginTop: theme.spacing(2) },
  videoCard: {
    position: 'relative',
    marginBottom: theme.spacing(2),
    minHeight: '250px',
  },
  videoContainer: {
    position: 'relative',
    width: '100%',
    height: '200px',
    backgroundColor: '#111',
    borderRadius: theme.shape.borderRadius,
    overflow: 'hidden',
  },
  snapshot: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
  videoOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.75)',
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
  statsCard: { marginBottom: theme.spacing(2) },
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
  fullscreenOverlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'black',
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
}));

const WebcamMonitor = () => {
  const classes = useStyles();
  const [activeStreams, setActiveStreams] = useState({});
  const [stats, setStats] = useState({ total: 0, active: 0, disconnected: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fullscreenId, setFullscreenId] = useState(null);
  const fullscreenIdRef = useRef(null);
  const socketRef = useRef(null);
  // userId -> latest frame src
  const frameRefs = useRef({});
  // userId -> last seen timestamp (to avoid stale React state in the interval)
  const lastSeenRefs = useRef({});
  // img element refs for fullscreen
  const fullscreenImgRef = useRef(null);

  useEffect(() => {
    const token = isAuthenticatedAdmin();

    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
    // If the API URL ends with /api, strip it out to connect to the root namespace
    const socketUrl = apiUrl.endsWith('/api') ? apiUrl.slice(0, -4) : apiUrl;
    console.log('Connecting to monitoring server at:', socketUrl);
    socketRef.current = io(socketUrl, {
      auth: { token }, // ← send admin JWT so server can authenticate
    });

    socketRef.current.on('connect', () => {
      console.log('Admin monitoring connected');
      setLoading(false);
      setError(null);
      // Ask for any already-active streams
      socketRef.current.emit('requestStreams');
    });

    socketRef.current.on('connect_error', (err) => {
      console.error('Monitoring connection error:', err.message);
      setError(`Failed to connect to ${apiUrl}: ${err.message}`);
      setLoading(false);
    });

    // Full snapshot of currently-active streams on connect
    socketRef.current.on('activeStreams', (streams) => {
      const map = {};
      streams.forEach((s) => { map[s.userId] = { ...s, lastSeen: Date.now() }; });
      setActiveStreams(map);
    });

    // A new student just connected (no frame yet)
    socketRef.current.on('studentConnected', (data) => {
      lastSeenRefs.current[data.userId] = Date.now();
      setActiveStreams((prev) => ({
        ...prev,
        [data.userId]: { ...prev[data.userId], ...data, lastSeen: Date.now() },
      }));
    });

    // Incoming camera frame (base64 JPEG)
    socketRef.current.on('videoFrame', (data) => {
      const { userId, frame, userName } = data;

      // Update img element directly (no React re-render per frame)
      const imgEl = frameRefs.current[userId];
      if (imgEl) imgEl.src = frame;
      lastSeenRefs.current[userId] = Date.now();

      // Update fullscreen img too if this user is fullscreened
      if (fullscreenImgRef.current && fullscreenIdRef.current === userId) {
        fullscreenImgRef.current.src = frame;
      }

      // Only update React state for status/meta changes
      setActiveStreams((prev) => {
        if (prev[userId]?.status === 'active') return prev; // avoid needless re-renders
        return {
          ...prev,
          [userId]: {
            ...prev[userId],
            userId,
            userName: userName || prev[userId]?.userName,
            status: 'active',
            lastSeen: Date.now(),
          },
        };
      });
    });

    // Stream metadata update
    socketRef.current.on('streamUpdate', (data) => {
      if (data.userId) lastSeenRefs.current[data.userId] = Date.now();
      setActiveStreams((prev) => ({
        ...prev,
        [data.userId]: { ...prev[data.userId], ...data, lastSeen: Date.now() },
      }));
    });

    // Student disconnected
    socketRef.current.on('streamDisconnected', (data) => {
      setActiveStreams((prev) => ({
        ...prev,
        [data.userId]: { ...prev[data.userId], status: 'disconnected', lastSeen: Date.now() },
      }));
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Synchronize fullscreen ref for the websocket closure, 
  // and immediately copy the latest frame so there's no delay when opening
  useEffect(() => {
    fullscreenIdRef.current = fullscreenId;
    if (fullscreenId && fullscreenImgRef.current && frameRefs.current[fullscreenId]) {
      fullscreenImgRef.current.src = frameRefs.current[fullscreenId].src;
    }
  }, [fullscreenId]);

  // Stats
  useEffect(() => {
    const list = Object.values(activeStreams);
    setStats({
      total: list.length,
      active: list.filter((s) => s.status === 'active').length,
      disconnected: list.filter((s) => s.status === 'disconnected').length,
    });
  }, [activeStreams]);

  // Mark stale streams as disconnected
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setActiveStreams((prev) => {
        let changed = false;
        const updated = { ...prev };
        Object.keys(updated).forEach((uid) => {
          const lastSeen = lastSeenRefs.current[uid] || updated[uid].lastSeen;
          if (updated[uid].status === 'active' && now - lastSeen > 10000) {
            updated[uid] = { ...updated[uid], status: 'disconnected' };
            changed = true;
          }
        });
        return changed ? updated : prev;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    if (socketRef.current?.connected) {
      socketRef.current.emit('requestStreams');
      setTimeout(() => setLoading(false), 1000);
    }
  };

  const getStatusColor = (status) =>
    status === 'active' ? 'primary' : status === 'connected' ? 'default' : 'secondary';

  const renderVideoCard = (userId, streamData) => (
    <Grid item xs={12} sm={6} md={4} lg={3} key={userId}>
      <Card className={classes.videoCard}>
        <div className={classes.videoContainer}>

          {/* Snapshot <img> — updated imperatively via frameRefs to avoid per-frame re-renders */}
          <img
            ref={(el) => { frameRefs.current[userId] = el; }}
            className={classes.snapshot}
            alt={`cam-${userId}`}
            style={{ display: streamData.status === 'active' ? 'block' : 'none' }}
          />

          {/* Placeholder when no stream yet */}
          {streamData.status !== 'active' && (
            <div className={classes.videoOverlay}>
              <Box textAlign="center">
                <VideocamOff fontSize="large" />
                <Typography variant="body2" style={{ marginTop: 8 }}>
                  {streamData.status === 'disconnected' ? 'Disconnected' : 'Waiting for stream…'}
                </Typography>
              </Box>
            </div>
          )}

          {/* Name badge */}
          <div className={classes.userInfo}>
            <Chip
              icon={<Person />}
              label={streamData.userName || `User ${userId.slice(0, 8)}`}
              size="small"
              color="primary"
              variant="outlined"
              style={{ backgroundColor: 'rgba(0,0,0,0.5)', color: 'white', borderColor: 'white' }}
            />
          </div>

          {/* Status badge */}
          <div className={classes.statusChip}>
            <Chip
              label={streamData.status}
              size="small"
              color={getStatusColor(streamData.status)}
              style={{ textTransform: 'capitalize' }}
            />
          </div>

          {/* Fullscreen button */}
          <div className={classes.controls}>
            <Tooltip title="Fullscreen">
              <IconButton
                size="small"
                onClick={() => setFullscreenId(userId)}
                style={{ color: 'white', backgroundColor: 'rgba(0,0,0,0.4)' }}
              >
                <Fullscreen />
              </IconButton>
            </Tooltip>
          </div>
        </div>

        <CardContent style={{ paddingTop: 8, paddingBottom: '8px !important' }}>
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

  if (loading) {
    return (
      <div className={classes.loadingContainer}>
        <CircularProgress />
        <Typography variant="body1" style={{ marginLeft: 16 }}>
          Connecting to monitoring server…
        </Typography>
      </div>
    );
  }

  if (error) {
    return (
      <Box className={classes.root}>
        <Paper style={{ padding: 16, backgroundColor: '#ffebee', border: '1px solid #f44336', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="body1" style={{ color: '#d32f2f' }}>{error}</Typography>
          <IconButton onClick={handleRefresh}><Refresh /></IconButton>
        </Paper>
      </Box>
    );
  }

  const streamList = Object.entries(activeStreams);

  return (
    <div className={classes.root}>
      <Typography variant="h4" gutterBottom>Live Webcam Monitoring</Typography>

      {/* Stats row */}
      <Grid container spacing={2} className={classes.statsCard}>
        {[
          { label: 'Total Sessions', value: stats.total, color: '#1976d2' },
          { label: 'Active Streams',  value: stats.active, color: '#388e3c' },
          { label: 'Disconnected',    value: stats.disconnected, color: '#d32f2f' },
        ].map(({ label, value, color }) => (
          <Grid item xs={12} sm={4} key={label}>
            <Paper style={{ padding: 16, textAlign: 'center' }}>
              <Typography variant="h5" style={{ color }}>{value}</Typography>
              <Typography variant="body2" color="textSecondary">{label}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Header + refresh */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Active Test Sessions ({streamList.length})</Typography>
        <Tooltip title="Refresh streams">
          <IconButton onClick={handleRefresh} color="primary"><Refresh /></IconButton>
        </Tooltip>
      </Box>

      {/* Stream grid */}
      {streamList.length === 0 ? (
        <Paper className={classes.noStreams}>
          <VideocamOff fontSize="large" />
          <Typography variant="h6" gutterBottom style={{ marginTop: 8 }}>No Active Streams</Typography>
          <Typography variant="body2">Students will appear here when they start their exams.</Typography>
        </Paper>
      ) : (
        <Grid container spacing={2} className={classes.monitorGrid}>
          {streamList.map(([userId, data]) => renderVideoCard(userId, data))}
        </Grid>
      )}

      {/* Fullscreen overlay */}
      {fullscreenId && activeStreams[fullscreenId] && (
        <div className={classes.fullscreenOverlay} onClick={() => setFullscreenId(null)}>
          <Box position="relative" width="90%" maxWidth="960px">
            <img
              ref={fullscreenImgRef}
              alt="fullscreen-cam"
              style={{ width: '100%', borderRadius: 8, display: 'block' }}
            />
            <Typography variant="h6" style={{ color: 'white', textAlign: 'center', marginTop: 8 }}>
              {activeStreams[fullscreenId]?.userName} — click anywhere to close
            </Typography>
            <IconButton
              style={{ position: 'absolute', top: 8, right: 8, color: 'white', backgroundColor: 'rgba(0,0,0,0.5)' }}
              onClick={() => setFullscreenId(null)}
            >
              <FullscreenExit />
            </IconButton>
          </Box>
        </div>
      )}
    </div>
  );
};

export default WebcamMonitor;
