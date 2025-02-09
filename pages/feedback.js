import { useState, useEffect } from "react";
import { supabase } from "../utils/supabase";
import { useRouter } from "next/router";
import AudioRecord from "./api/AudioRecordTranscribe";

export default function Feedback({ students = [], skills = [] }) {
  // State for student auto-complete
  const [studentQuery, setStudentQuery] = useState("");
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [storedAudioUrl, setStoredAudioUrl] = useState(null);
  const [audioTranscription, setAudioTranscription] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const transcription = sessionStorage.getItem('audioTranscription');
      if (transcription) {
        setAudioTranscription(transcription);
      }
    }
  }, []);
  const router = useRouter();

  // New useEffect to check and pre-upload an audio recording if one exists in sessionStorage.
  useEffect(() => {
    const storedAudio = sessionStorage.getItem("audioRecording");
    if (storedAudio) {
      const uploadStoredAudio = async () => {
        try {
          // Convert the base64 string back to a Blob
          const base64Response = await fetch(storedAudio);
          const audioBlob = await base64Response.blob();
          const fileName = `${Date.now()}-recording.mp3`;
          // Upload the Blob to Supabase (ensure bucket name is correct)
          const { data: uploadData, error: uploadError } =
            await supabase.storage
              .from("Feedback Submissions")
              .upload(fileName, audioBlob);
          if (uploadError) {
            console.error("Error uploading audio:", uploadError);
          } else {
            const { data: publicUrlData } = supabase.storage
              .from("Feedback Submissions")
              .getPublicUrl(uploadData.path);
            setStoredAudioUrl(publicUrlData.publicUrl);
            console.log("Pre-uploaded audio URL:", publicUrlData.publicUrl);
          }
        } catch (error) {
          console.error("Error processing stored audio:", error);
        }
      };
      uploadStoredAudio();
    }
  }, []);

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
      alert("Please select a student first");
      return;
    }
    if (!selectedSkill) {
      alert("Please select a skill first");
      return;
    }
    if (!textNote) {
      alert("Please enter some notes first");
      return;
    }

    // Determine the attachment URL:
    let attachmentUrl = null;
    if (attachmentFile) {
      const fileName = `${Date.now()}-${attachmentFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from("Feedback Submissions")
        .upload(fileName, attachmentFile);
      if (uploadError) {
        console.error("Error uploading file:", uploadError);
        alert(`Error uploading file: ${uploadError.message}`);
        return;
      }
      const { data: publicUrlData } = supabase.storage
        .from("Feedback Submissions")
        .getPublicUrl(uploadData.path);
      attachmentUrl = publicUrlData.publicUrl;
    } else if (sessionStorage.getItem("capturedImage")) {
      // (Your existing image branch, if any)
      try {
        const storedImage = sessionStorage.getItem("capturedImage");
        const base64Response = await fetch(storedImage);
        const imageBlob = await base64Response.blob();
        const fileName = `${Date.now()}-photo.jpg`;
        const { data: uploadData, error: uploadError } = await supabase
          .storage
          .from("Feedback Submissions")
          .upload(fileName, imageBlob);
        if (uploadError) {
          console.error("Error uploading image:", uploadError);
          alert(`Error uploading image: ${uploadError.message}`);
          return;
        }
        const { data: publicUrlData } = supabase.storage
          .from("Feedback Submissions")
          .getPublicUrl(uploadData.path);
        attachmentUrl = publicUrlData.publicUrl;
        sessionStorage.removeItem("capturedImage");
      } catch (error) {
        console.error("Error processing stored image:", error);
        alert("Error processing stored image.");
        return;
      }
    } else if (sessionStorage.getItem("capturedVideo")) {
      // Process the captured video from sessionStorage
      try {
        const storedVideo = sessionStorage.getItem("capturedVideo");
        const base64Response = await fetch(storedVideo);
        const videoBlob = await base64Response.blob();
        const fileName = `${Date.now()}-video.webm`;
        const { data: uploadData, error: uploadError } = await supabase
          .storage
          .from("Feedback Submissions") // Ensure bucket name is correct.
          .upload(fileName, videoBlob);
        if (uploadError) {
          console.error("Error uploading video:", uploadError);
          alert(`Error uploading video: ${uploadError.message}`);
          return;
        }
        const { data: publicUrlData } = supabase.storage
          .from("Feedback Submissions")
          .getPublicUrl(uploadData.path);
        attachmentUrl = publicUrlData.publicUrl;
        sessionStorage.removeItem("capturedVideo");
      } catch (error) {
        console.error("Error processing stored video:", error);
        alert("Error processing stored video.");
        return;
      }
    } else if (storedAudioUrl) {
      // Use the pre-uploaded audio recording URL
      attachmentUrl = storedAudioUrl;
      sessionStorage.removeItem("audioRecording");
    }


    try {
      // 2. Insert into the "feedback" table
      const { data, error } = await supabase
        .from("feedback")
        .insert({
          user_id: teacherId, // teacher giving the feedback
          student_id: selectedStudent.user_id,
          classroom_id: classroomId,
          skill_id: selectedSkill,
          text_note: textNote,
          rating: chosenRating,
          file_url: attachmentUrl,
          transcription: sessionStorage.getItem('audioTranscription') || '',
          approval_status: "APPROVED", // teacher auto-approves
        })
        .select();

      if (error) {
        console.error("Error inserting feedback:", error);
        alert("Could not insert feedback");
      } else {
        console.log("Feedback inserted:", data);
        alert("Feedback submitted!");

        // 3. Reset form if you like
        setSelectedStudent(null);
        setStudentQuery("");
        setSelectedSkill(null);
        setTextNote("");
      }
      // Redirect to index.js with a query param
      router.push("/?submitted=true");
    } catch (err) {
      console.error("Unexpected error:", err);
      alert("Something went wrong");
    }
  }

  function goToFeedback(mediaType) {
    if (mediaType === "audio") {
      router.push("/audio-record");
    } else {
      router.push(`/feedback?media=${mediaType}`);
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
          <div style={{ ...styles.textNoteContainer, position: "relative" }}>
            <textarea
              id="textNote"
              rows="4"
              style={styles.textArea}
              value={textNote}
              onChange={(e) => setTextNote(e.target.value)}
              placeholder="Speak or begin typing"
            />
            {/* The AudioRecord button is now overlaid on the textarea */}
            <AudioRecord
              onTranscription={(newText) =>
                setTextNote((prev) => prev + " " + newText)
              }
            />
          </div>
          <div style={styles.attachmentContainer}>
            {sessionStorage.getItem("capturedImage") ? (
              <div>
                <label>Captured Photo:</label>
                <img
                  src={sessionStorage.getItem("capturedImage")}
                  alt="Captured"
                  style={{ maxWidth: "100%" }}
                />
              </div>
            ) : sessionStorage.getItem("capturedVideo") ? (
              <div>
                <label>Captured Video:</label>
                <video
                  src={sessionStorage.getItem("capturedVideo")}
                  controls
                  style={{ maxWidth: "100%" }}
                />
              </div>
            ) : storedAudioUrl ? (
              <div>
                <label>Audio Recording:</label>
                <audio src={storedAudioUrl} controls />
              </div>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>

        {/* RATING BOXES */}
        <div style={styles.ratingRow}>
          {["E", "G", "S", "NI"].map((r) => (
            <div
              key={r}
              onClick={() => handleRatingClick(r)}
              style={{
                ...styles.ratingBox,
                backgroundColor: r === rating ? "#cce5ff" : "#f8f9fa",
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
    fontFamily: "Arial, sans-serif",
    color: "#333",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  input: {
    padding: "0.5rem",
    border: "1px solid #ccc",
    borderRadius: "4px",
    fontSize: "1rem",
  },
  dropdown: {
    border: "1px solid #ccc",
    marginTop: "-1rem",
    marginBottom: "1rem",
    maxHeight: "150px",
    overflowY: "auto",
    backgroundColor: "#fff",
    borderRadius: "4px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  dropdownItem: {
    padding: "0.5rem",
    cursor: "pointer",
    borderBottom: "1px solid #eee",
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
    backgroundColor: "#f8f9fa",
    transition: "background-color 0.2s ease-in-out",
  },
  notesContainer: {
    display: "flex",
    gap: "1rem",
  },
  textNoteContainer: {
    flex: 2,
    position: "relative", // Needed for positioning the mic icon
  },
  textArea: {
    width: "100%",
    padding: "1rem",
    boxSizing: "border-box",
    border: "1px solid #ccc",
    borderRadius: "4px",
    fontSize: "1rem",
    resize: "vertical",
  },
  attachmentContainer: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
  },
  ratingRow: {
    display: "flex",
    gap: "1rem",
    marginTop: "1rem",
  },
  ratingBox: {
    border: "1px solid #ccc",
    padding: "1rem",
    cursor: "pointer",
    textAlign: "center",
    width: "50px",
    borderRadius: "4px",
    fontSize: "1.2rem",
    transition: "background-color 0.2s ease-in-out",
  },
  button: {
    width: "120px",
    padding: "0.5rem",
    cursor: "pointer",
    border: "none",
    borderRadius: "4px",
    backgroundColor: "#0070f3",
    color: "#fff",
    fontSize: "1rem",
    transition: "background-color 0.2s ease-in-out",
  },
};
