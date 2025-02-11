import { Button } from "@/components/ui/button";
import Link from "next/link";
import { StudentList } from "./StudentList";
import { headers } from "next/headers";

async function getStudents() {
    const headersList = headers();
    const response = await fetch(`${headersList.get('origin')}/api/students`, {
        cache: 'no-store'
    });
    
    if (!response.ok) {
        throw new Error('Failed to fetch students');
    }

    const data = await response.json();
    return data.students;
}

export default async function StudentPage() {
    const students = await getStudents();

    return (
        <div className="container mx-auto p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Class Learner Profiles</h1>
                <Link href="/">
                    <Button variant="outline">
                        Back to Start Screen
                    </Button>
                </Link>
            </div>

            <StudentList initialStudents={students || []} />
        </div>
    );
}