import io from 'socket.io-client';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.stream = null;
    this.frameInterval = null; // canvas snapshot interval
    this.videoElement = null;  // hidden <video> used for frame capture
    this.canvas = null;
    this.ctx = null;
  }

  connect(token) {
    if (this.socket && this.isConnected) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
      console.log('Connecting WebSocket to:', apiUrl);
      this.socket = io(apiUrl, {
        auth: { token },
      });

      this.socket.on('connect', () => {
        console.log('WebSocket connected');
        this.isConnected = true;
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
        this.isConnected = false;
        reject(error);
      });

      this.socket.on('disconnect', () => {
        console.log('WebSocket disconnected');
        this.isConnected = false;
        this.stopVideoStreaming();
      });
    });
  }

  disconnect() {
    this.stopVideoStreaming();
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  /**
   * Start streaming: get camera stream, then send canvas snapshots every 500ms.
   * Returns the MediaStream so the caller can attach it to a <video> element.
   */
  async startVideoStreaming() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Camera access not supported in this browser');
    }

    // Acquire camera
    this.stream = await navigator.mediaDevices.getUserMedia({
      video: { width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 15 } },
      audio: false,
    });

    // Off-screen <video> to draw frames from
    this.videoElement = document.createElement('video');
    this.videoElement.srcObject = this.stream;
    this.videoElement.muted = true;
    this.videoElement.playsInline = true;
    await this.videoElement.play();

    // Off-screen <canvas> for JPEG encoding
    this.canvas = document.createElement('canvas');
    this.canvas.width = 320;  // downscale to save bandwidth
    this.canvas.height = 240;
    this.ctx = this.canvas.getContext('2d');

    // Send a snapshot frame every 500ms
    this.frameInterval = setInterval(() => {
      this._captureAndSend();
    }, 500);

    console.log('Video streaming started (canvas snapshot mode)');
    return this.stream;
  }

  _captureAndSend() {
    if (!this.isConnected || !this.ctx || !this.videoElement) return;
    try {
      this.ctx.drawImage(this.videoElement, 0, 0, this.canvas.width, this.canvas.height);
      const frame = this.canvas.toDataURL('image/jpeg', 0.6); // 60% quality
      this.socket.emit('videoFrame', { frame });
    } catch (e) {
      // video not ready yet — skip frame
    }
  }

  stopVideoStreaming() {
    if (this.frameInterval) {
      clearInterval(this.frameInterval);
      this.frameInterval = null;
    }
    if (this.videoElement) {
      this.videoElement.pause();
      this.videoElement.srcObject = null;
      this.videoElement = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    this.canvas = null;
    this.ctx = null;
    console.log('Video streaming stopped');
  }

  sendStreamUpdate(data) {
    if (this.isConnected && this.socket) {
      this.socket.emit('streamUpdate', data);
    }
  }

  getVideoStream() { return this.stream; }
  isStreaming() { return this.frameInterval !== null; }
}

const webSocketService = new WebSocketService();
export default webSocketService;
