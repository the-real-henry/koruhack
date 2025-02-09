// pages/index.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const [notification, setNotification] = useState('');
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
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
  function goToFeedback(mediaType) {
    if (mediaType === 'audio') {
      router.push('/audio-record');
    } else if (mediaType === 'photo') {
      setShowImageUpload(true);
    } else {
      router.push(`/feedback?media=${mediaType}`);
    }
  }

  function handleImageUpload(e) {
    if (e.target.files?.[0]) {
      setSelectedImage(e.target.files[0]);
      router.push('/feedback?media=photo');
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

      {/* Image Upload Modal */}
      {showImageUpload && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h2>Upload Image</h2>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={styles.fileInput}
            />
            <button 
              onClick={() => setShowImageUpload(false)}
              style={styles.closeButton}
            >
              Cancel
            </button>
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
