
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../utils/supabase';

export default function StudentProfiles() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [feedbackData, setFeedbackData] = useState({});
  const router = useRouter();

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    const { data: studentsData } = await supabase
      .from('users')
      .select('*')
      .eq('user_type', 'Student')
      .order('last_name');
    setStudents(studentsData || []);
  };

  const handleStudentClick = async (student) => {
    setSelectedStudent(student);
    const { data: feedback } = await supabase
      .from('feedback')
      .select('*')
      .eq('student_id', student.user_id)
      .order('created_at', { ascending: false });
    setFeedbackData({ ...feedbackData, [student.user_id]: feedback });
  };

  const StudentFeedback = ({ feedback }) => {
    const date = new Date(feedback.created_at).toLocaleDateString();
    
    return (
      <div style={styles.feedbackCard}>
        <div style={styles.feedbackHeader}>
          <span style={styles.date}>{date}</span>
          <span style={styles.rating}>Rating: {feedback.rating}</span>
        </div>
        <p style={styles.textNote}>{feedback.text_note}</p>
        
        {feedback.file_url && feedback.file_url.includes('.mp3') && (
          <div style={styles.mediaContainer}>
            <h4>Audio Evidence:</h4>
            <audio controls style={styles.audioPlayer}>
              <source src={feedback.file_url} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
            <div style={styles.transcription}>
              <h4>Transcription:</h4>
              <p>{feedback.speech_transcription || feedback.transcription || 'No transcription available'}</p>
            </div>
          </div>
        )}
        
        {feedback.file_url && feedback.file_url.includes('.jpg') && (
          <div style={styles.mediaContainer}>
            <h4>Photo Evidence:</h4>
            <img src={feedback.file_url} alt="Evidence" style={styles.image} />
          </div>
        )}
        
        {feedback.file_url && feedback.file_url.includes('.webm') && (
          <div style={styles.mediaContainer}>
            <h4>Video Evidence:</h4>
            <video controls style={styles.video}>
              <source src={feedback.file_url} type="video/webm" />
              Your browser does not support the video element.
            </video>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <button 
        onClick={() => router.push('/')}
        style={styles.backButton}
      >
        Back to Start Screen
      </button>
      
      <div style={styles.layout}>
        <div style={styles.studentList}>
          <h2>Class Learner Profiles</h2>
          {students.map((student) => (
            <div 
              key={student.user_id} 
              style={{
                ...styles.studentCard,
                backgroundColor: selectedStudent?.user_id === student.user_id ? '#e3f2fd' : 'white'
              }}
              onClick={() => handleStudentClick(student)}
            >
              <h3>{student.first_name} {student.last_name}</h3>
            </div>
          ))}
        </div>

        {selectedStudent && (
          <div style={styles.feedbackList}>
            <h2>{selectedStudent.first_name}'s Feedback History</h2>
            {feedbackData[selectedStudent.user_id]?.length > 0 ? (
              feedbackData[selectedStudent.user_id].map((feedback) => (
                <StudentFeedback key={feedback.feedback_id} feedback={feedback} />
              ))
            ) : (
              <p>No feedback available for this student.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: '300px 1fr',
    gap: '2rem',
    marginTop: '2rem',
  },
  studentList: {
    borderRight: '1px solid #eee',
  },
  studentCard: {
    padding: '1rem',
    margin: '0.5rem 0',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  feedbackList: {
    padding: '0 1rem',
  },
  feedbackCard: {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '1rem',
    marginBottom: '1rem',
  },
  feedbackHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '0.5rem',
  },
  date: {
    color: '#666',
  },
  rating: {
    fontWeight: 'bold',
  },
  textNote: {
    margin: '1rem 0',
  },
  mediaContainer: {
    marginTop: '1rem',
    padding: '1rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '4px',
  },
  audioPlayer: {
    width: '100%',
    marginBottom: '1rem',
  },
  transcription: {
    borderTop: '1px solid #ddd',
    paddingTop: '1rem',
  },
  backButton: {
    padding: '0.5rem 1rem',
    cursor: 'pointer',
  },
  image: {
    maxWidth: '100%',
    borderRadius: '4px',
    marginTop: '0.5rem',
  },
  video: {
    width: '100%',
    borderRadius: '4px',
    marginTop: '0.5rem',
  },
};
