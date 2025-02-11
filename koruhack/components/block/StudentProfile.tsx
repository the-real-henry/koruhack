"use client";

import { useEffect, useState } from "react";
import { FeedbackCard } from "./FeedbackCard";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { SkillWheel } from "./SkillWheel";

interface StudentProfileProps {
    studentId: string;
    firstName: string;
}

interface Feedback {
    feedback_id: string;
    created_at: string;
    rating: number;
    text_note: string;
    file_url?: string;
    transcription?: string;
}

export function StudentProfile({ studentId, firstName }: StudentProfileProps) {
    const [feedbackData, setFeedbackData] = useState<Feedback[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchFeedbackData = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(`/api/feedback?studentId=${studentId}`);
                if (!response.ok) throw new Error('Failed to fetch feedback');
                
                const data = await response.json();
                setFeedbackData(data.feedback || []);
            } catch (error) {
                console.error('Error fetching feedback:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchFeedbackData();
    }, [studentId]);

    if (isLoading) {
        return (
            <div className="h-full flex items-center justify-center">
                <span className="text-muted-foreground">Loading feedback...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">{firstName}'s Learning Profile</h2>
                <Button
                    onClick={() => router.push(`/report-card-comments?studentId=${studentId}`)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                >
                    Generate Report Card Comments
                </Button>
            </div>

            <SkillWheel 
                studentId={studentId}
                feedbackData={feedbackData}
            />

            <h3 className="text-xl font-semibold mt-8 mb-4">Feedback History</h3>
            
            {feedbackData.length > 0 ? (
                <div className="space-y-4">
                    {feedbackData.map((feedback) => (
                        <FeedbackCard
                            key={feedback.feedback_id}
                            feedback={feedback}
                        />
                    ))}
                </div>
            ) : (
                <p className="text-muted-foreground">
                    No feedback available for this student.
                </p>
            )}
        </div>
    );
} 