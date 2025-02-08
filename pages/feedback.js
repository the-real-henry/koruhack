import { useState, useEffect } from "react";
import { supabase } from "../utils/supabase";
import { useRouter } from 'next/router';


export default function Feedback({ students = [], skills = [] }) {
  // State for student auto-complete
  const [studentQuery, setStudentQuery] = useState("");
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const router = useRouter();

  // State for skill selection (just one skill)
  const [selectedSkill, setSelectedSkill] = useState(null);

  // Text note
  const [textNote, setTextNote] = useState("");

  // State for rating (E, G, S, NI)
  const [rating, setRating] = useState(null);
  
  // State for file attachment
  const [attachmentFile, setAttachmentFile] = useState(null);

  // Filter students as you type
  useEffect(() => {
    const q = studentQuery.toLowerCase();
    const results = students.filter(
      (s) =>
        s.first_name.toLowerCase().includes(q) ||
        s.last_name.toLowerCase().includes(q),
    );
    setFilteredStudents(results);
  }, [studentQuery, students]);

  // Handle picking a student from the dropdown
  function pickStudent(student) {
    setSelectedStudent(student);
    setStudentQuery(`${student.first_name} ${student.last_name}`);
    setFilteredStudents([]); // close dropdown
  }

  function handleSubmit(e) {
    e.preventDefault();
    // For demonstration, we just log them:
    const studentId = selectedStudent?.user_id || null;
    const skillId = selectedSkill || null;

    console.log("Selected Student ID:", studentId);
    console.log("Selected Skill ID:", skillId);
    console.log("Text Note:", textNote);

    // TODO: Insert into your "feedback" table if desired
    // await supabase.from('feedback').insert({...})
  }

  async function handleRatingClick(chosenRating) {
    // For demonstration, teacher ID = 7 & Classroom ID = 2
    const teacherId = 7;        
    const classroomId = 2;
    
    // 1. Ensure student, skill, and text note are filled
    if (!selectedStudent) {
      alert('Please select a student first');
      return;
    }
    if (!selectedSkill) {
      alert('Please select a skill first');
      return;
    }
    if (!textNote) {
      alert('Please enter some notes first');
      return;
    }
    
    // Upload file if one is attached.
    let attachmentUrl = null;
    if (attachmentFile) {
      const fileName = `${Date.now()}-${attachmentFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('Feedback Submissions')
        .upload(fileName, attachmentFile);
      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        alert(`Error uploading file: ${uploadError.message}`);
        return;
      }

      // Retrieve the public URL for the uploaded file
      const { data: publicUrlData } = supabase
        .storage
        .from('Feedback Submissions')
        .getPublicUrl(uploadData.path);
      attachmentUrl = publicUrlData.publicUrl;
    }

    try {
      // 2. Insert into the "feedback" table
      const { data, error } = await supabase
        .from('feedback')
        .insert({
          user_id: teacherId,                // teacher giving the feedback
          student_id: selectedStudent.user_id,
          classroom_id: classroomId, 
          skill_id: selectedSkill,
          text_note: textNote,
          rating: chosenRating,
          file_url: attachmentUrl,
          approval_status: 'APPROVED',       // teacher auto-approves
        })
        .select();

      if (error) {
        console.error('Error inserting feedback:', error);
        alert('Could not insert feedback');
      } else {
        console.log('Feedback inserted:', data);
        alert('Feedback submitted!');

        // 3. Reset form if you like
        setSelectedStudent(null);
        setStudentQuery('');
        setSelectedSkill(null);
        setTextNote('');
      }
      // Redirect to index.js with a query param
      router.push('/?submitted=true');
    } catch (err) {
      console.error('Unexpected error:', err);
      alert('Something went wrong');
    }
  }

  return (
    <div style={styles.container}>
      <h1>New Feedback</h1>

      <form onSubmit={handleSubmit} style={styles.form}>
        {/* STUDENT INPUT with auto-complete */}
        <label htmlFor="studentSearch">Student:</label>
        <input
          id="studentSearch"
          type="text"
          placeholder="Type student name..."
          value={studentQuery}
          onChange={(e) => {
            setStudentQuery(e.target.value);
            setSelectedStudent(null);
          }}
          style={styles.input}
        />
        {/* Dropdown of filtered students */}
        {filteredStudents.length > 0 && (
          <div style={styles.dropdown}>
            {filteredStudents.map((student) => (
              <div
                key={student.user_id}
                onClick={() => pickStudent(student)}
                style={styles.dropdownItem}
              >
                {student.first_name} {student.last_name}
              </div>
            ))}
          </div>
        )}

        {/* SKILL BOXES */}
        <label>Skill:</label>
        <div style={styles.skillRow}>
          {skills.map((skill) => (
            <div
              key={skill.skill_id}
              onClick={() => setSelectedSkill(skill.skill_id)}
              style={{
                ...styles.skillBox,
                backgroundColor:
                  selectedSkill === skill.skill_id ? "#cce5ff" : "#f8f9fa",
              }}
            >
              {skill.name}
            </div>
          ))}
        </div>

        {/* TEXT NOTE and ATTACHMENT */}
        <label htmlFor="textNote">Notes:</label>
        <div style={styles.notesContainer}>
          <div style={styles.textNoteContainer}>
            <textarea
              id="textNote"
              rows="4"
              style={styles.textArea}
              value={textNote}
              onChange={(e) => setTextNote(e.target.value)}
              placeholder="Add additional context..."
            />
          </div>
          <div style={styles.attachmentContainer}>
            <label htmlFor="attachment">Attachment:</label>
            <input
              id="attachment"
              type="file"
              onChange={(e) => {
                if (e.target.files.length > 0) {
                  setAttachmentFile(e.target.files[0]);
                }
              }}
            />
          </div>
        </div>

        {/* RATING BOXES */}
        <div style={styles.ratingRow}>
          {['E', 'G', 'S', 'NI'].map((r) => (
            <div
              key={r}
              onClick={() => handleRatingClick(r)}
              style={{
                ...styles.ratingBox,
                backgroundColor: r === rating ? '#cce5ff' : '#f8f9fa',
                // or highlight if you want to show a "selected" color
              }}
            >
              {r}
            </div>
          ))}
        </div>
      </form>
    </div>
  );
}

// Fetch students (user_type='Student') and skills server-side
export async function getServerSideProps() {
  // Students
  const { data: students, error: studentError } = await supabase
    .from("users")
    .select("*")
    .eq("user_type", "Student")
    .order("last_name");

  if (studentError) {
    console.error("Error fetching students:", studentError);
  }

  // Skills
  const { data: skills, error: skillError } = await supabase
    .from("skill")
    .select("*")
    .order("name");

  if (skillError) {
    console.error("Error fetching skills:", skillError);
  }

  return {
    props: {
      students: students || [],
      skills: skills || [],
    },
  };
}

// Inline styles for demo
const styles = {
  container: {
    maxWidth: "600px",
    margin: "auto",
    padding: "1rem",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  input: {
    padding: "0.5rem",
  },
  dropdown: {
    border: "1px solid #ccc",
    marginTop: "-1rem",
    marginBottom: "1rem",
    maxHeight: "150px",
    overflowY: "auto",
  },
  dropdownItem: {
    padding: "0.5rem",
    cursor: "pointer",
  },
  skillRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.5rem",
  },
  skillBox: {
    border: "1px solid #ccc",
    padding: "0.5rem 1rem",
    cursor: "pointer",
    borderRadius: "4px",
  },
  ratingRow: {
    display: 'flex',
    gap: '1rem',
    marginTop: '1rem',
  },
  ratingBox: {
    border: '1px solid #ccc',
    padding: '1rem',
    cursor: 'pointer',
    textAlign: 'center',
    width: '50px',
    borderRadius: '4px',
    fontSize: '1.2rem',
  },
  button: {
    width: "120px",
    padding: "0.5rem",
    cursor: "pointer",
  },
  notesContainer: {
    display: 'flex',
    gap: '1rem',
  },
  textNoteContainer: {
    flex: 2,
  },
  attachmentContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },

};
