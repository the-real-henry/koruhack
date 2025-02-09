
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../utils/supabase';

export default function StudentProfiles({ students = [] }) {
  const router = useRouter();

  return (
    <div style={styles.container}>
      <button 
        onClick={() => router.push('/')}
        style={styles.backButton}
      >
        Back to Start Screen
      </button>
      
      <h1>Class Learner Profiles</h1>
      
      <div style={styles.studentGrid}>
        {students.map((student) => (
          <div key={student.user_id} style={styles.studentCard}>
            <h3>{student.first_name} {student.last_name}</h3>
            <button 
              onClick={() => router.push(`/feedback?studentId=${student.user_id}`)}
              style={styles.viewButton}
            >
              View Profile
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export async function getServerSideProps() {
  const { data: students, error } = await supabase
    .from('users')
    .select('*')
    .eq('user_type', 'Student')
    .order('last_name');

  if (error) {
    console.error('Error fetching students:', error);
    return { props: { students: [] } };
  }

  return {
    props: {
      students: students || [],
    },
  };
}

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  backButton: {
    padding: '0.5rem 1rem',
    marginBottom: '2rem',
    cursor: 'pointer',
  },
  studentGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '1rem',
    marginTop: '2rem',
  },
  studentCard: {
    padding: '1rem',
    border: '1px solid #ddd',
    borderRadius: '8px',
    textAlign: 'center',
  },
  viewButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#0070f3',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};
