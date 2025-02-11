"use client";

interface SkillWheelProps {
    studentId: string;
    feedbackData: any[];
}

export function SkillWheel({ studentId, feedbackData }: SkillWheelProps) {
    // This is a placeholder for the actual skill wheel implementation
    // You'll need to implement the actual visualization logic here
    return (
        <div className="w-full aspect-square max-w-[500px] mx-auto bg-muted rounded-full flex items-center justify-center">
            <span className="text-muted-foreground">
                Skill Wheel Visualization
            </span>
        </div>
    );
} 