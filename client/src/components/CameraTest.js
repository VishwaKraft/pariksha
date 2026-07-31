import React, { useState, useEffect } from 'react';
import { Button, Typography, Box, Paper } from '@material-ui/core';

const CameraTest = ({ onCameraReady, onError }) => {
  const [isTesting, setIsTesting] = useState(false);
  const [error, setError] = useState(null);
  const [cameraSupported, setCameraSupported] = useState(true);

  useEffect(() => {
    // Check if getUserMedia is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraSupported(false);
      setError('Camera access not supported in this browser');
    }
  }, []);

  const testCamera = async () => {
    setIsTesting(true);
    setError(null);

    try {
      // Check if we're on HTTPS or localhost
      if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        throw new Error('Camera access requires HTTPS or localhost');
      }

      // Test camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 15, max: 30 }
        },
        audio: false
      });

      // Stop the test stream
      stream.getTracks().forEach(track => track.stop());
      
      onCameraReady && onCameraReady();
    } catch (error) {
      console.error('Camera test error:', error);
      let errorMessage = 'Camera test failed';
      
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Camera access denied. Please allow camera permissions and try again.';
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'No camera found. Please connect a camera and try again.';
      } else if (error.name === 'NotReadableError') {
        errorMessage = 'Camera is already in use by another application.';
      } else if (error.name === 'OverconstrainedError') {
        errorMessage = 'Camera constraints cannot be satisfied.';
      } else if (error.name === 'SecurityError') {
        errorMessage = 'Camera access blocked due to security restrictions. Please use HTTPS or localhost.';
      } else if (error.message.includes('HTTPS or localhost')) {
        errorMessage = 'Camera access requires HTTPS or localhost. Please use a secure connection.';
      }
      
      setError(errorMessage);
      onError && onError(errorMessage);
    } finally {
      setIsTesting(false);
    }
  };

  if (!cameraSupported) {
    return (
      <Paper elevation={2} style={{ padding: 16, backgroundColor: '#ffebee', border: '1px solid #f44336' }}>
        <Typography variant="h6" style={{ color: '#d32f2f', marginBottom: 8 }}>Camera Not Supported</Typography>
        <Typography style={{ color: '#d32f2f' }}>
          Your browser doesn't support camera access. Please use a modern browser like Chrome, Firefox, or Safari.
        </Typography>
      </Paper>
    );
  }

  return (
    <Box p={2}>
      <Typography variant="h6" gutterBottom>
        Camera Test
      </Typography>
      
      {error && (
        <Paper elevation={2} style={{ padding: 16, backgroundColor: '#ffebee', border: '1px solid #f44336', marginBottom: 16 }}>
          <Typography style={{ color: '#d32f2f' }}>
            {error}
          </Typography>
        </Paper>
      )}
      
      <Typography variant="body2" color="textSecondary" paragraph>
        Click the button below to test your camera access. This will help identify any issues before starting the test.
      </Typography>
      
      <Button
        variant="contained"
        color="primary"
        onClick={testCamera}
        disabled={isTesting}
        fullWidth
      >
        {isTesting ? 'Testing Camera...' : 'Test Camera Access'}
      </Button>
      
      <Typography variant="caption" display="block" style={{ marginTop: 8 }}>
        <strong>Tips:</strong>
        <br />• Make sure your camera is connected and not being used by other applications
        <br />• Allow camera permissions when prompted by your browser
        <br />• Use HTTPS or localhost for camera access
        <br />• Try refreshing the page if the test fails
      </Typography>
    </Box>
  );
};

export default CameraTest;
