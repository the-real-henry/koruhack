import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

// Get feedback for a specific student
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const studentId = searchParams.get('studentId');

        if (!studentId) {
            return NextResponse.json(
                { error: 'Student ID is required' },
                { status: 400 }
            );
        }
        const supabase = await createClient();

        const { data: feedback, error } = await supabase
            .from('feedback')
            .select('*')
            .eq('student_id', studentId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json({ feedback });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch feedback' },
            { status: 500 }
        );
    }
}

// Update feedback (e.g., adding transcription)
export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const { feedback_id, transcription } = body;

        if (!feedback_id || !transcription) {
            return NextResponse.json(
                { error: 'Feedback ID and transcription are required' },
                { status: 400 }
            );
        }

        const supabase = await createClient();

        const { data, error } = await supabase
            .from('feedback')
            .update({ transcription })
            .eq('feedback_id', feedback_id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ feedback: data });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to update feedback' },
            { status: 500 }
        );
    }
} 