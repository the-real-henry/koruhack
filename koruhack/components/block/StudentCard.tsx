"use client";

import { cn } from "@/lib/utils";

interface StudentCardProps {
    firstName: string;
    lastName: string;
    userId: string;
    isSelected: boolean;
    onClick: () => void;
}

export function StudentCard({ firstName, lastName, userId, isSelected, onClick }: StudentCardProps) {
    return (
        <div 
            onClick={onClick}
            className={cn(
                "p-4 my-2 rounded-lg cursor-pointer transition-all duration-200",
                "hover:bg-primary/5",
                isSelected ? "bg-primary/10" : "bg-white"
            )}
        >
            <h3 className="text-lg font-medium">
                {firstName} {lastName}
            </h3>
        </div>
    );
} 