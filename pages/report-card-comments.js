
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';

export default function ReportCardComments() {
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { studentId } = router.query;

  const generateComments = useCallback(async () => {
    try {
      const response = await fetch('/api/generate-comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ studentId }),
      });

      const data = await response.json();

      if (response.ok) {
        setComments(data.comments);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error generating comments:', error);
      setComments('Error generating comments. Please try again.');
    }
    setLoading(false);
  }, [studentId]);

  useEffect(() => {
    if (studentId) {
      generateComments();
    }
  }, [studentId, generateComments]);

  return (
    <div style={styles.container}>
      <button 
        onClick={() => router.back()}
        style={styles.backButton}
      >
        Back to Profile
      </button>
      <h1>Report Card Comments</h1>
      {loading ? (
        <p>Generating comments...</p>
      ) : (
        <div style={styles.commentsContainer}>
          <h2>Generated Comments</h2>
          <div style={styles.comments}>
            {comments}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '800px',
    margin: '0 auto',
  },
  backButton: {
    padding: '0.5rem 1rem',
    marginBottom: '1rem',
    cursor: 'pointer',
  },
  commentsContainer: {
    marginTop: '2rem',
  },
  comments: {
    padding: '1rem',
    backgroundColor: '#f5f5f5',
    borderRadius: '8px',
    whiteSpace: 'pre-wrap',
    lineHeight: '1.6',
  },
};
