// AudioRecord.js
import { useState, useRef } from "react";

export default function AudioRecord({ onTranscription }) {
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);

  const startRecording = async () => {
    try {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert("Speech recognition is not supported in your browser.");
        return;
      }
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = "";
        for (let i = 0; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + " ";
          }
        }
        finalTranscript = finalTranscript.trim();
        if (finalTranscript && onTranscription) {
          onTranscription(finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting speech recognition:", error);
      alert("Error accessing speech recognition.");
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <button
      type="button"
      onClick={isRecording ? stopRecording : startRecording}
      style={{
        background: "none",
        border: "none",
        position: "absolute",
        right: "10px",
        bottom: "10px",
        cursor: "pointer",
      }}
      title={isRecording ? "Stop Recording" : "Start Recording"}
    >
      {isRecording ? (
        // A simple stop icon (■) shown when recording
        <span style={{ fontSize: "20px", color: "red" }}>■</span>
      ) : (
        // A mic icon (🎤) when not recording
        <span style={{ fontSize: "20px" }}>🎤</span>
      )}
    </button>
  );
}
