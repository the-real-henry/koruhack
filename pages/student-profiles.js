
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../utils/supabase';

function StudentFeedback({ feedback }) {
  if (!feedback) return null;

  return (
    <div style={styles.feedbackItem}>
      <div style={styles.feedbackHeader}>
        <span style={styles.date}>
          {new Date(feedback.created_at).toLocaleDateString()}
        </span>
        <span style={styles.rating}>Rating: {feedback.rating}</span>
      </div>
      <p style={styles.note}>{feedback.text_note}</p>
      {feedback.file_url && (
        <div style={styles.mediaContainer}>
          {feedback.file_url.includes('.mp3') ? (
            <>
              <audio src={feedback.file_url} controls style={styles.media} />
            </>
          ) : feedback.file_url.includes('.webm') ? (
            <video src={feedback.file_url} controls style={styles.media} />
          ) : (
            <img src={feedback.file_url} alt="Feedback media" style={styles.media} />
          )}
        </div>
      )}
    </div>
  );
}

export default function StudentProfiles({ students = [], feedbackData = {} }) {
  const router = useRouter();
  const [selectedStudent, setSelectedStudent] = useState(null);

  const handleStudentClick = (student) => {
    setSelectedStudent(student);
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

export async function getServerSideProps() {
  const { data: students, error: studentError } = await supabase
    .from('users')
    .select('*')
    .eq('user_type', 'Student')
    .order('last_name');

  if (studentError) {
    console.error('Error fetching students:', studentError);
    return { props: { students: [] } };
  }

  // Fetch feedback for all students
  const { data: feedback, error: feedbackError } = await supabase
    .from('feedback')
    .select('*')
    .order('created_at', { ascending: false });

  if (feedbackError) {
    console.error('Error fetching feedback:', feedbackError);
    return { props: { students: students || [], feedbackData: {} } };
  }

  // Organize feedback by student_id
  const feedbackByStudent = feedback.reduce((acc, item) => {
    if (!acc[item.student_id]) {
      acc[item.student_id] = [];
    }
    acc[item.student_id].push(item);
    return acc;
  }, {});

  return {
    props: {
      students: students || [],
      feedbackData: feedbackByStudent,
    },
  };
}

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  layout: {
    display: 'flex',
    gap: '2rem',
    marginTop: '2rem',
  },
  studentList: {
    flex: '0 0 300px',
  },
  feedbackList: {
    flex: '1',
  },
  backButton: {
    padding: '0.5rem 1rem',
    marginBottom: '2rem',
    cursor: 'pointer',
  },
  studentCard: {
    padding: '1rem',
    border: '1px solid #ddd',
    borderRadius: '8px',
    marginBottom: '1rem',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  feedbackItem: {
    padding: '1rem',
    border: '1px solid #ddd',
    borderRadius: '8px',
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
  note: {
    margin: '1rem 0',
  },
  mediaContainer: {
    marginTop: '1rem',
  },
  media: {
    maxWidth: '100%',
    borderRadius: '4px',
  },
};
