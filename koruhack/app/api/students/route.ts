import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const supabase = await createClient();

        const { data: students, error } = await supabase
            .from('users')
            .select('*')
            .eq('user_type', 'Student')
            .order('last_name');

        if (error) throw error;

        return NextResponse.json({ students });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 });
    }
} 