
import React, { useState, useRef } from 'react';
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
        audio: true
      });
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: 'audio/webm'
        });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);

        // Create form data for API
        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.webm');

        // Transcribe the audio
        setIsTranscribing(true);
        try {
          const response = await fetch('/api/transcribe', {
            method: 'POST',
            body: formData,
          });
          
          const data = await response.json();
          console.log('Transcription response:', data);
          
          if (data.text) {
            setTranscription(data.text);
          } else {
            console.log('No transcription text in response');
          }
        } catch (error) {
          console.error('Transcription error:', error);
        }
        setIsTranscribing(false);
      };

      mediaRecorderRef.current.start(10);
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Audio Recorder</h1>
      <div>
        <button onClick={isRecording ? stopRecording : startRecording}>
          {isRecording ? 'Stop Recording' : 'Start Recording'}
        </button>
        
        {audioURL && (
          <div style={{ marginTop: '20px' }}>
            <audio src={audioURL} controls />
          </div>
        )}
        
        {isTranscribing && <p>Transcribing...</p>}
        {transcription && (
          <div style={{ marginTop: '20px' }}>
            <h3>Transcription:</h3>
            <p>{transcription}</p>
          </div>
        )}
      </div>
    </div>
  );
}
