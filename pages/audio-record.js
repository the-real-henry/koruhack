
import { useState, useRef } from 'react';
import { useRouter } from 'next/router';

export default function AudioRecord() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState('');
  const [transcription, setTranscription] = useState('');
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const router = useRouter();
  const recognitionRef = useRef(null);

  const startRecording = async () => {
    try {
      const constraints = { audio: true, video: false };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      // Initialize speech recognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          }
        }
        if (finalTranscript) {
          setTranscription(finalTranscript.trim());
        }
      };

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mpeg' });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
      };

      mediaRecorderRef.current.start(10);
      recognitionRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Error accessing microphone. Please ensure you have granted permission.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleSubmit = () => {
    router.push('/feedback');
  };

  return (
    <div style={styles.container}>
      <h1>Audio Recording</h1>

      <div style={styles.controls}>
        {!isRecording ? (
          <button onClick={startRecording} style={{...styles.button, backgroundColor: '#4CAF50'}}>
            Start Recording
          </button>
        ) : (
          <button onClick={stopRecording} style={{...styles.button, backgroundColor: '#ff4444'}}>
            Stop Recording
          </button>
        )}
      </div>

      {audioURL && (
        <div style={styles.audioPreview}>
          <audio src={audioURL} controls />
          {transcription && (
            <div style={styles.transcription}>
              <h3>Transcription:</h3>
              <div style={styles.transcriptionText}>{transcription}</div>
            </div>
          )}
          <button onClick={handleSubmit} style={styles.submitButton}>
            Use Recording
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  transcriptionText: {
    whiteSpace: 'pre-wrap',
    lineHeight: '1.5',
    fontSize: '1.1rem',
    padding: '1rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    margin: '1rem 0',
    maxHeight: '300px',
    overflowY: 'auto',
  },
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
  transcription: {
    textAlign: 'left',
    width: '100%',
    padding: '1rem',
    backgroundColor: '#f5f5f5',
    borderRadius: '4px',
  }
};
