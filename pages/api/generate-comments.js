
import { OpenAI } from 'openai';
import { supabase } from '../../utils/supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { studentId } = req.body;

  try {
    const { data: feedbackData } = await supabase
      .from('feedback')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    if (!feedbackData || feedbackData.length === 0) {
      return res.status(404).json({ error: 'No feedback data available' });
    }

    const feedbackSummary = feedbackData.map(fb => 
      `Date: ${new Date(fb.created_at).toLocaleDateString()}\nSkill: ${fb.skill_id}\nRating: ${fb.rating}\nNote: ${fb.text_note}`
    ).join('\n\n');

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

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

    res.status(200).json({ comments: completion.choices[0].message.content });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error generating comments' });
  }
}
