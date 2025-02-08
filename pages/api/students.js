// pages/api/students.js
import { supabase } from '../../utils/supabase';

export default async function handler(req, res) {
  // We only want rows where user_type = 'Student'
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('user_type', 'Student');

  if (error) {
    return res.status(500).json({ error: error.message });
  }
  return res.status(200).json({ students: data });
}
