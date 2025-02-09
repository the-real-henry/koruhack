// pages/index.js
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const [notification, setNotification] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef(null);
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
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          setShowCamera(true);
        };
      }
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

  function goToFeedback(mediaType) {
    if (mediaType === 'audio') {
      router.push('/audio-record');
    } else if (mediaType === 'photo') {
      startCamera();
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
