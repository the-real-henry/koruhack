// pages/index.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const [notification, setNotification] = useState('');
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

  // Navigate to /feedback with a "media" query param
  function goToFeedback(mediaType) {
    router.push(`/feedback?media=${mediaType}`);
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
    </div>
  );
}

// Inline styles for quick prototyping:
const styles = {
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
