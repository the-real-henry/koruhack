import { useState, useRef } from 'react';
import { useRouter } from 'next/router';

export default function AudioRecord() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState('');
  const [transcription, setTranscription] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const router = useRouter();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          channelCount: 1,
          sampleRate: 44100
        }
      });
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
        audioBitsPerSecond: 128000
      });
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);

        // Transcribe the audio
        setIsTranscribing(true);
        try {
          const formData = new FormData();
          formData.append('audio', audioBlob, 'recording.wav');
          const response = await fetch('/api/transcribe', {
            method: 'POST',
            body: formData,
          });

          const data = await response.json();
          console.log('Transcription response:', data);
          if (data.text) {
            setTranscription(data.text);
            console.log('Setting transcription:', data.text);
          } else {
            console.error('No transcription text in response');
          }
        } catch (error) {
          console.error('Transcription error:', error);
          alert('Error transcribing audio');
        }
        setIsTranscribing(false);
      };

      mediaRecorderRef.current.start(200);
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
          {isTranscribing ? (
            <div>Transcribing...</div>
          ) : transcription && (
            <div style={styles.transcription}>
              <h3>Transcription:</h3>
              <p>{transcription}</p>
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