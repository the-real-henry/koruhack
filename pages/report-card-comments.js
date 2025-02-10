
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { OpenAI } from 'openai';
import { supabase } from '../utils/supabase';

export default function ReportCardComments() {
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { studentId } = router.query;

  useEffect(() => {
    if (studentId) {
      generateComments();
    }
  }, [studentId]);

  const generateComments = async () => {
    try {
      // Fetch all feedback for this student
      const { data: feedbackData } = await supabase
        .from('feedback')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });

      if (!feedbackData || feedbackData.length === 0) {
        setComments('No feedback data available for this student.');
        setLoading(false);
        return;
      }

      // Prepare the feedback data for the prompt
      const feedbackSummary = feedbackData.map(fb => 
        `Date: ${new Date(fb.created_at).toLocaleDateString()}\nSkill: ${fb.skill_id}\nRating: ${fb.rating}\nNote: ${fb.text_note}`
      ).join('\n\n');

      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        dangerouslyAllowBrowser: true
      });

      console.log('Making OpenAI request with API key:', process.env.NEXT_PUBLIC_OPENAI_API_KEY ? 'Key exists' : 'No key found');
      
      const completion = await openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are an experienced teacher writing report card comments. Write constructive, specific comments based on the student's feedback history."
          },
          {
            role: "user",
            content: `Based on the following feedback history, generate a comprehensive report card comment:\n\n${feedbackSummary}`
          }
        ],
        model: "gpt-4",
      });

      console.log('OpenAI response:', completion);
      setComments(completion.choices[0].message.content);
    } catch (error) {
      console.error('Error generating comments:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setComments('Error generating comments. Please try again.');
    }
    setLoading(false);
  };

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
