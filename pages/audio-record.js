
import { useState, useRef } from 'react';
import { useRouter } from 'next/router';

export default function AudioRecord() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState('');
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const router = useRouter();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Error accessing microphone. Please ensure you have granted permission.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleSubmit = () => {
    // Here you would typically upload the audio file
    // For now, we'll just return to the feedback page
    router.push('/feedback');
  };

  return (
    <div style={styles.container}>
      <h1>Audio Recording</h1>
      
      <div style={styles.controls}>
        {!isRecording ? (
          <button onClick={startRecording} style={styles.button}>
            Start Recording
          </button>
        ) : (
          <button onClick={stopRecording} style={styles.button}>
            Stop Recording
          </button>
        )}
      </div>

      {audioURL && (
        <div style={styles.audioPreview}>
          <audio src={audioURL} controls />
          <button onClick={handleSubmit} style={styles.submitButton}>
            Use Recording
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '600px',
    margin: '2rem auto',
    padding: '1rem',
    textAlign: 'center',
  },
  controls: {
    marginBottom: '2rem',
  },
  button: {
    padding: '1rem 2rem',
    fontSize: '1.2rem',
    backgroundColor: isRecording ? '#ff4444' : '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  audioPreview: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
  },
  submitButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#0070f3',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};
