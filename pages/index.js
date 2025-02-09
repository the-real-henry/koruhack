// pages/index.js
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const [notification, setNotification] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const router = useRouter();

  useEffect(() => {
    // Check for "submitted" query parameter
    const params = new URLSearchParams(window.location.search);
    if (params.has('submitted') && !notification) {
      setNotification('Feedback submitted successfully!');
      // Remove the query parameter so the notification doesn't persist
      router.replace('/', undefined, { shallow: true });
    }
  }, [notification, router]);

  // Navigate to appropriate page based on media type
  async function startCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert('Your browser does not support camera access');
      return;
    }

    try {
      setShowCamera(true); // Show the modal first
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      // Wait for next render to ensure video element exists
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }, 100);
    } catch (error) {
      if (error.name === 'NotAllowedError') {
        alert('Camera access was denied. Please allow camera access to use this feature.');
      } else if (error.name === 'NotFoundError') {
        alert('No camera device was found on your system.');
      } else {
        alert('Error accessing camera: ' + error.message);
      }
      console.error('Camera error:', error);
    }
  }

  function capturePhoto() {
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
    
    canvas.toBlob((blob) => {
      const imageUrl = URL.createObjectURL(blob);
      // Stop the camera stream
      const stream = videoRef.current.srcObject;
      stream.getTracks().forEach(track => track.stop());
      setShowCamera(false);
      router.push(`/feedback?media=photo&imageUrl=${imageUrl}`);
    }, 'image/jpeg');
  }

  async function startVideo() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert('Your browser does not support video recording');
      return;
    }

    try {
      setShowVideo(true);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true,
        audio: true
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const videoBlob = new Blob(chunksRef.current, { type: 'video/webm' });
        const videoUrl = URL.createObjectURL(videoBlob);
        const stream = videoRef.current.srcObject;
        stream.getTracks().forEach(track => track.stop());
        setShowVideo(false);
        router.push(`/feedback?media=video&videoUrl=${videoUrl}`);
      };
    } catch (error) {
      console.error('Error accessing camera/microphone:', error);
      alert('Error accessing camera/microphone. Please ensure you have granted permission.');
    }
  }

  function goToFeedback(mediaType) {
    if (mediaType === 'audio') {
      router.push('/audio-record');
    } else if (mediaType === 'photo') {
      startCamera();
    } else if (mediaType === 'video') {
      startVideo();
    } else {
      router.push(`/feedback?media=${mediaType}`);
    }
  }

  return (
    <div style={styles.container}>
      <h1>Start Screen</h1>
      {/* Notification Bar */}
      {notification && (
        <div style={styles.notification}>{notification}</div>
      )}

      {/* Media Buttons */}
      <div style={styles.buttonRow}>
        <button onClick={() => goToFeedback('audio')} style={styles.bigButton}>
          <span role="img" aria-label="mic">🎤</span> Mic
        </button>
        <button onClick={() => goToFeedback('photo')} style={styles.bigButton}>
          <span role="img" aria-label="camera">📷</span> Camera
        </button>
        <button onClick={() => goToFeedback('video')} style={styles.bigButton}>
          <span role="img" aria-label="video">📹</span> Video
        </button>
      </div>

      {/* Text Button */}
      <button onClick={() => goToFeedback('text')} style={styles.textButton}>
        Add Text Only
      </button>

      {/* Video Recording Modal */}
      {showVideo && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h2>{isRecording ? 'Recording Video...' : 'Start Recording'}</h2>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              style={styles.video}
            />
            <div style={styles.buttonGroup}>
              {!isRecording ? (
                <button 
                  onClick={() => {
                    setIsRecording(true);
                    mediaRecorderRef.current.start();
                  }}
                  style={styles.captureButton}
                >
                  Start Recording
                </button>
              ) : (
                <button 
                  onClick={() => {
                    setIsRecording(false);
                    mediaRecorderRef.current.stop();
                  }}
                  style={{...styles.captureButton, backgroundColor: '#ff4444'}}
                >
                  Stop Recording
                </button>
              )}
              <button 
                onClick={() => {
                  const stream = videoRef.current.srcObject;
                  stream.getTracks().forEach(track => track.stop());
                  setShowVideo(false);
                  setIsRecording(false);
                }}
                style={styles.closeButton}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Camera Modal */}
      {showCamera && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h2>Take Photo</h2>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              style={styles.video}
            />
            <div style={styles.buttonGroup}>
              <button 
                onClick={capturePhoto}
                style={styles.captureButton}
              >
                Capture
              </button>
              <button 
                onClick={() => {
                  const stream = videoRef.current.srcObject;
                  stream.getTracks().forEach(track => track.stop());
                  setShowCamera(false);
                }}
                style={styles.closeButton}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Inline styles for quick prototyping:
const styles = {
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    alignItems: 'center',
  },
  fileInput: {
    margin: '1rem 0',
  },
  video: {
    width: '100%',
    maxWidth: '500px',
    borderRadius: '8px',
  },
  buttonGroup: {
    display: 'flex',
    gap: '1rem',
    marginTop: '1rem',
  },
  captureButton: {
    padding: '0.5rem 1rem',
    cursor: 'pointer',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
  },
  closeButton: {
    padding: '0.5rem 1rem',
    cursor: 'pointer',
    backgroundColor: '#ff4444',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
  },
  buttonRow: {
    display: 'flex',
    gap: '1rem',
    margin: '2rem',
  },
  bigButton: {
    width: '120px',
    height: '150px',
    fontSize: '1.2rem',
    cursor: 'pointer',
  },
  textButton: {
    padding: '1rem 2rem',
    fontSize: '1rem',
    cursor: 'pointer',
  },
  notification: {
    backgroundColor: '#dff0d8',
    color: '#3c763d',
    padding: '1rem',
    marginBottom: '1rem',
    borderRadius: '5px',
    textAlign: 'center',
    width: '100%',
    maxWidth: '400px',
  },
};
