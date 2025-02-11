"use client";

import { useState } from "react";
import { StudentCard } from "@/components/block/StudentCard";
import { StudentProfile } from "@/components/block/StudentProfile";

interface Student {
    user_id: string;
    first_name: string;
    last_name: string;
}

interface StudentListProps {
    initialStudents: Student[];
}

export function StudentList({ initialStudents }: StudentListProps) {
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

    return (
        <div className="grid grid-cols-[300px_1fr] gap-8">
            {/* Student List */}
            <div className="border-r border-border pr-4">
                {initialStudents.map((student) => (
                    <StudentCard
                        key={student.user_id}
                        firstName={student.first_name}
                        lastName={student.last_name}
                        userId={student.user_id}
                        isSelected={selectedStudent?.user_id === student.user_id}
                        onClick={() => setSelectedStudent(student)}
                    />
                ))}
            </div>

            {/* Student Profile Section */}
            <div className="min-h-[500px]">
                {selectedStudent ? (
                    <StudentProfile
                        studentId={selectedStudent.user_id}
                        firstName={selectedStudent.first_name}
                    />
                ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                        Select a student to view their profile
                    </div>
                )}
            </div>
        </div>
    );
} 